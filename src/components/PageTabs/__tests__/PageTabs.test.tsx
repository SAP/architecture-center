/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageTabs from '../index';

const mockOpenDocument = jest.fn();
const mockUsePageDataStore = jest.fn();

jest.mock('@site/src/store/pageDataStore', () => ({
    usePageDataStore: () => mockUsePageDataStore(),
}));

jest.mock('@ui5/webcomponents-icons/dist/AllIcons', () => ({}));

jest.mock('lucide-react', () => ({
    Plus: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
    Eye: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
}));

const documents = [
    {
        id: 'root',
        title: 'Main Architecture',
        tags: [],
        authors: [],
        editorState: null,
        parentId: null,
    },
    {
        id: 'child',
        title: 'Integration Details',
        tags: [],
        authors: [],
        editorState: null,
        parentId: 'root',
    },
    {
        id: 'shared',
        title: 'Shared Architecture',
        tags: [],
        authors: [],
        editorState: null,
        parentId: null,
        isReadOnly: true,
    },
];

describe('PageTabs', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePageDataStore.mockReturnValue({
            documents,
            activeDocumentId: 'root',
            openDocument: mockOpenDocument,
        });
    });

    it('exposes document navigation as named buttons and marks the active document', () => {
        render(<PageTabs onAddNew={jest.fn()} />);

        expect(
            screen.getByRole('navigation', { name: 'Reference Architecture documents' })
        ).toBeInTheDocument();

        const activeDocument = screen.getByRole('button', { name: 'Open Main Architecture' });
        expect(activeDocument).toHaveAttribute('aria-current', 'page');
        expect(screen.getByRole('button', { name: 'Open Integration Details' })).not.toHaveAttribute(
            'aria-current'
        );
        expect(
            screen.getByRole('button', { name: 'Open Shared Architecture (view only)' })
        ).toBeInTheDocument();
    });

    it('opens a document from the keyboard', async () => {
        const user = userEvent.setup();
        render(<PageTabs onAddNew={jest.fn()} />);

        const childDocument = screen.getByRole('button', { name: 'Open Integration Details' });
        childDocument.focus();
        await user.keyboard('{Enter}');

        expect(mockOpenDocument).toHaveBeenCalledWith('child');
    });

    it('keeps the add action separate from document activation', async () => {
        const user = userEvent.setup();
        const onAddNew = jest.fn();
        render(<PageTabs onAddNew={onAddNew} />);

        const documentButton = screen.getByRole('button', { name: 'Open Main Architecture' });
        const addButton = screen.getByRole('button', { name: 'Add sub-page to Main Architecture' });

        expect(documentButton).not.toContainElement(addButton);
        await user.click(addButton);

        expect(onAddNew).toHaveBeenCalledWith('root');
        expect(mockOpenDocument).not.toHaveBeenCalled();
        expect(
            screen.queryByRole('button', { name: 'Add sub-page to Shared Architecture' })
        ).not.toBeInTheDocument();
    });
});
