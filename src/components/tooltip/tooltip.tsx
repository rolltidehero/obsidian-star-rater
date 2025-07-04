import * as React from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
    content, 
    children
}: TooltipProps) => {

    const hideTimeout = React.useRef<NodeJS.Timeout | null>(null);

    return (
        <Tippy
            content={content}
            delay={[250, 250]}
            hideOnClick={false}
            duration={[250, 250]}
        >
            {children}
        </Tippy>
    );
};

export default Tooltip;