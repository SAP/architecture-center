/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchitectureTabs from '../ArchitectureTabs';

jest.mock('@ui5/webcomponents-icons/dist/AllIcons', () => ({}));
jest.mock('@ui5/webcomponents-react', () => ({
    Icon: (props: React.SVGProps<SVGSVGElement>) => <svg {...props} />,
}));

jest.mock('../../../context/AuthContext', () => ({
    useAuth: () => ({
        users: { github: null, btp: null },
    }),
}));

const tabs = [
    {
        title: 'First feature',
        subtitle: 'First feature description',
        icon: 'sap-icon://initiative',
        link: '/first',
    },
    {
        title: 'Second feature',
        subtitle: 'Second feature description',
        icon: 'sap-icon://initiative',
        link: '/second',
    },
    {
        title: 'Third feature',
        subtitle: 'Third feature description',
        icon: 'sap-icon://initiative',
        link: '/third',
    },
];

describe('ArchitectureTabs keyboard navigation', () => {
    it('uses an automatically activated horizontal tab list', () => {
        render(<ArchitectureTabs tabs={tabs} />);

        const tabList = screen.getByRole('tablist', { name: 'Architecture Center features' });
        const renderedTabs = screen.getAllByRole('tab');
        const panel = screen.getByRole('tabpanel');

        expect(tabList).toHaveAttribute('aria-orientation', 'horizontal');
        expect(renderedTabs[0]).toHaveAttribute('aria-selected', 'true');
        expect(renderedTabs[0]).toHaveAttribute('tabindex', '0');
        expect(renderedTabs[1]).toHaveAttribute('tabindex', '-1');
        expect(panel).toHaveAttribute('aria-labelledby', renderedTabs[0].id);
    });

    it('moves focus and selection with arrow keys, including wrapping', async () => {
        const user = userEvent.setup();
        const onManualTabChange = jest.fn();
        render(<ArchitectureTabs tabs={tabs} onManualTabChange={onManualTabChange} />);

        const renderedTabs = screen.getAllByRole('tab');
        renderedTabs[0].focus();

        await user.keyboard('{ArrowRight}');
        expect(renderedTabs[1]).toHaveFocus();
        expect(renderedTabs[1]).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', renderedTabs[1].id);

        await user.keyboard('{ArrowRight}{ArrowRight}');
        expect(renderedTabs[0]).toHaveFocus();
        expect(renderedTabs[0]).toHaveAttribute('aria-selected', 'true');

        await user.keyboard('{ArrowLeft}');
        expect(renderedTabs[2]).toHaveFocus();
        expect(renderedTabs[2]).toHaveAttribute('aria-selected', 'true');
        expect(onManualTabChange).toHaveBeenCalledTimes(4);
    });

    it('moves focus and selection to the first and last tabs with Home and End', async () => {
        const user = userEvent.setup();
        render(<ArchitectureTabs tabs={tabs} />);

        const renderedTabs = screen.getAllByRole('tab');
        renderedTabs[0].focus();

        await user.keyboard('{End}');
        expect(renderedTabs[2]).toHaveFocus();
        expect(renderedTabs[2]).toHaveAttribute('aria-selected', 'true');

        await user.keyboard('{Home}');
        expect(renderedTabs[0]).toHaveFocus();
        expect(renderedTabs[0]).toHaveAttribute('aria-selected', 'true');
    });
});
