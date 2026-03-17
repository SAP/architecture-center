import cds from '@sap/cds';
import crypto from 'node:crypto';

class QuickstartService extends cds.ApplicationService {
    async init() {
        this.before('UPDATE', 'Documents', async (req: cds.Request) => {
            const { data } = req;
            if (!('parent_ID' in data)) return;

            const documentId: string | undefined = (data as any).ID ?? (req.params?.[0] as any)?.ID;
            const newParentId = (data as any).parent_ID as string | null | undefined;

            if (!documentId) {
                req.error(400, 'Missing document ID for update');
                return;
            }

            if (!newParentId) return; // unparenting (setting null/undefined) is allowed

            if (newParentId === documentId) {
                req.error(400, 'A document cannot be its own parent');
                return;
            }

            const validationError = await this.validateMoveNoCycles(documentId, newParentId);
            if (validationError) req.error(validationError.status, validationError.message);
        });

        this.on('DELETE', 'Documents', async (req: cds.Request) => {
            const rootId: string | undefined = (req.data as any)?.ID ?? (req.params?.[0] as any)?.ID;
            if (!rootId) {
                req.error(400, 'Missing document ID for delete');
                return;
            }

            await this.cascadeDeleteSubpages(req, rootId);
        });

        this.on('assignDocumentContributors', this.handleAssignDocumentContributors.bind(this));

        return super.init();
    }

    public async handleAssignDocumentContributors(req: cds.Request) {
        const tx = cds.tx(req);
        const { Documents, Users, DocumentContributors } = this.entities as any;
        const SELECT = cds.ql.SELECT;
        const INSERT = cds.ql.INSERT;
        const DELETE = cds.ql.DELETE;

        const documentId = (req.data as any)?.documentId as string | undefined;
        const contributorUsernames = (req.data as any)?.contributors as string[] | undefined;

        if (!documentId) return req.error(400, 'Missing parameter: documentId');
        if (!Array.isArray(contributorUsernames)) {
            return req.error(400, 'Missing parameter: contributors');
        }

        const docExists = await tx.run(SELECT.one.from(Documents).columns('ID').where({ ID: documentId }));
        if (!docExists) return req.error(404, 'Document not found');

        const normalized = contributorUsernames
            .map(u => (typeof u === 'string' ? u.trim() : ''))
            .filter(u => u.length > 0);

        const uniqueUsernames = Array.from(new Set(normalized));

        const userIds: string[] = [];
        for (const ghUsername of uniqueUsernames) {
            const existing: { ID: string } | null = await tx.run(
                SELECT.one.from(Users).columns('ID').where({ ghUsername })
            );
            if (existing?.ID) {
                userIds.push(existing.ID);
                continue;
            }

            const newId = typeof (cds as any).utils?.uuid === 'function'
                ? (cds as any).utils.uuid()
                : crypto.randomUUID().toUpperCase();
            await tx.run(INSERT.into(Users).entries({ ID: newId, ghUsername }));
            userIds.push(newId);
        }

        // Overwrite: clear existing contributors and insert the new set.
        await tx.run(DELETE.from(DocumentContributors).where({ document_ID: documentId }));

        if (userIds.length > 0) {
            await tx.run(
                INSERT.into(DocumentContributors).entries(
                    userIds.map(user_ID => ({ document_ID: documentId, user_ID }))
                )
            );
        }

        return tx.run(SELECT.one.from(Documents).where({ ID: documentId }));
    }

    private async cascadeDeleteSubpages(req: cds.Request, rootId: string): Promise<void> {
        const tx = cds.tx(req);
        const { Documents, DocumentContributors } = this.entities as any;
        const SELECT = cds.ql.SELECT;
        const DELETE = cds.ql.DELETE;

        const roots = new Set([rootId]);
        const descendants = new Set<string>();
        let frontier: string[] = [rootId];

        for (let steps = 0; frontier.length > 0 && steps < 1000; steps++) {
            const rows: Array<{ ID: string }> = await tx.run(
                SELECT.from(Documents).columns('ID').where({ parent_ID: { in: frontier } })
            );

            const next: string[] = [];
            for (const row of rows) {
                const id = row?.ID;
                if (!id) continue;
                if (roots.has(id) || descendants.has(id)) continue;
                descendants.add(id);
                next.push(id);
            }

            frontier = next;
        }

        if (frontier.length > 0) {
            req.error(500, 'Hierarchy too deep or contains a loop');
            return;
        }

        const ids = [rootId, ...descendants];

        // Delete join rows first, then delete all documents in the subtree.
        await tx.run(DELETE.from(DocumentContributors).where({ document_ID: { in: ids } }));
        await tx.run(DELETE.from(Documents).where({ ID: { in: ids } }));
    }

    private async validateMoveNoCycles(
        documentId: string,
        parentId: string
    ): Promise<{ status: number; message: string } | null> {
        const tx: any = await cds.tx((cds as any).context);
        const { Documents } = this.entities as any;
        const SELECT = cds.ql.SELECT;

        // If parent is unchanged, skip further checks.
        const current: { parent_ID?: string | null } | null = await tx.run(
            SELECT.one.from(Documents).columns('parent_ID').where({ ID: documentId })
        );
        if (!current) return { status: 404, message: 'Document not found' };
        if (current.parent_ID === parentId) return null;

        // Verify parent exists and prevent cycles by walking up the parent chain.
        const visited = new Set<string>([documentId]);
        let cursor: string | null = parentId;

        for (let steps = 0; cursor && steps < 1000; steps++) {
            if (visited.has(cursor)) {
                return { status: 400, message: 'Moving would create a cycle in the document hierarchy' };
            }
            visited.add(cursor);

            const row: { parent_ID?: string | null } | null = await tx.run(
                SELECT.one.from(Documents).columns('parent_ID').where({ ID: cursor })
            );
            if (!row) return { status: 400, message: 'Parent document does not exist' };
            cursor = row.parent_ID ?? null;
        }

        if (cursor) return { status: 400, message: 'Hierarchy too deep or contains a loop' };
        return null;
    }
}

export default QuickstartService;