/// <reference types="@testing-library/jest-dom" />
import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
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

const matchMediaMock = window.matchMedia as jest.Mock;

beforeEach(() => {
    matchMediaMock.mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }));
});

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

    it('uses vertical orientation and Up/Down navigation at the mobile breakpoint', async () => {
        matchMediaMock.mockImplementation((query: string) => ({
            matches: query === '(max-width: 700px)',
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));
        const user = userEvent.setup();

        render(<ArchitectureTabs tabs={tabs} />);

        const tabList = screen.getByRole('tablist', { name: 'Architecture Center features' });
        const renderedTabs = screen.getAllByRole('tab');
        renderedTabs[0].focus();

        expect(tabList).toHaveAttribute('aria-orientation', 'vertical');
        await user.keyboard('{ArrowDown}');
        expect(renderedTabs[1]).toHaveFocus();
        expect(renderedTabs[1]).toHaveAttribute('aria-selected', 'true');

        await user.keyboard('{ArrowUp}');
        expect(renderedTabs[0]).toHaveFocus();
        await user.keyboard('{ArrowLeft}');
        expect(renderedTabs[0]).toHaveFocus();
    });

    it('does not leave the panel faded when a scroll transition is cancelled', () => {
        jest.useFakeTimers();
        try {
            const { rerender } = render(
                <ArchitectureTabs tabs={tabs} enableScrollActivation scrollActiveIndex={0} />
            );
            // Scroll moves to index 1 (starts the 150ms transition)...
            rerender(<ArchitectureTabs tabs={tabs} enableScrollActivation scrollActiveIndex={1} />);
            // ...then back to 0 within the window, cancelling that transition's timer.
            act(() => {
                jest.advanceTimersByTime(100);
            });
            rerender(<ArchitectureTabs tabs={tabs} enableScrollActivation scrollActiveIndex={0} />);
            act(() => {
                jest.advanceTimersByTime(300);
            });
            // isTransitioning must have been cleared: the panel is not stuck faded.
            expect(screen.getByRole('tabpanel').className).not.toContain('fadeOut');
        } finally {
            jest.useRealTimers();
        }
    });

    it('cancels a pending pointer transition when keyboard activation targets the active tab', () => {
        jest.useFakeTimers();
        try {
            render(<ArchitectureTabs tabs={tabs} />);
            const renderedTabs = screen.getAllByRole('tab');
            // Click the second tab: schedules a 200ms transition to index 1.
            act(() => {
                fireEvent.click(renderedTabs[1]);
            });
            // Before that timer fires, press Home: focuses tab 0 and activates it
            // immediately while index 0 is still the selected one.
            renderedTabs[1].focus();
            act(() => {
                fireEvent.keyDown(renderedTabs[1], { key: 'Home' });
            });
            // Let any pending pointer timer fire.
            act(() => {
                jest.advanceTimersByTime(300);
            });
            // Selection must stay on the keyboard target (tab 0), not jump to the
            // clicked tab 1 while focus sits on tab 0.
            expect(renderedTabs[0]).toHaveAttribute('aria-selected', 'true');
            expect(renderedTabs[0]).toHaveFocus();
        } finally {
            jest.useRealTimers();
        }
    });
});
