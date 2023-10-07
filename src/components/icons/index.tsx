import React, { ReactElement, SVGProps } from 'react'

function Icon({ name, width, height, ...props }: { name: string } & SVGProps<SVGSVGElement>): ReactElement {
    return (
        <svg className="bi" width={width ?? '1rem'} height={height ?? '1rem'} {...props}>
            <use xlinkHref={`/images/bootstrap-icons.svg#${name}`} />
        </svg>
    )
}

export function AlexaIcon({ ...props }) {
    return <Icon name="alexa" {...props} />
}

export function AppleIcon({ ...props }) {
    return <Icon name="apple" {...props} />
}

export function ArrowClockwiseIcon({ ...props }) {
    return <Icon name="arrow-clockwise" {...props} />
}

export function Basket3Icon({ ...props }) {
    return <Icon name="basket3" {...props} />
}

export function BoxArrowInRightIcon({ ...props }) {
    return <Icon name="box-arrow-in-right" {...props} />
}

export function BoxArrowInLeftIcon({ ...props }) {
    return <Icon name="box-arrow-in-left" {...props} />
}

export function CalendarEventIcon({ ...props }) {
    return <Icon name="calendar-event" {...props} />
}

export function CalendarPlusIcon({ ...props }) {
    return <Icon name="calendar-plus" {...props} />
}

export function CalendarWeekIcon({ ...props }) {
    return <Icon name="calendar-week" {...props} />
}

export function ChevronLeftIcon({ ...props }) {
    return <Icon name="chevron-left" {...props} />
}

export function ChevronRightIcon({ ...props }) {
    return <Icon name="chevron-right" {...props} />
}

export function CreditCardIcon({ ...props }) {
    return <Icon name="credit-card" {...props} />
}

export function CreditCard2BackIcon({ ...props }) {
    return <Icon name="credit-card-2-back" {...props} />
}

export function CreditCard2FrontIcon({ ...props }) {
    return <Icon name="credit-card-2-front" {...props} />
}

export function DashCircleIcon({ ...props }) {
    return <Icon name="dash-circle" {...props} />
}

export function EnvelopePlusIcon({ ...props }) {
    return <Icon name="envelope-plus" {...props} />
}

export function FacebookIcon({ ...props }) {
    return <Icon name="facebook" {...props} />
}

export function GiftIcon({ ...props }) {
    return <Icon name="gift" {...props} />
}

export function GoogleIcon({ ...props }) {
    return <Icon name="google" {...props} />
}

export function LayoutTextSidebarReverseIcon({ ...props }) {
    return <Icon name="layout-text-sidebar-reverse" {...props} />
}

export function ListIcon({ ...props }) {
    return <Icon name="list" {...props} />
}

export function MenuUpIcon({ ...props }) {
    return <Icon name="menu-up" {...props} />
}

export function PersonIcon({ ...props }) {
    return <Icon name="person" {...props} />
}

export function PersonDashIcon({ ...props }) {
    return <Icon name="person-dash" {...props} />
}

export function PersonPlusIcon({ ...props }) {
    return <Icon name="person-plus" {...props} />
}

export function PlusLgIcon({ ...props }) {
    return <Icon name="plus-lg" {...props} />
}

export function SearchIcon({ ...props }) {
    return <Icon name="search" {...props} />
}

export function XLgIcon({ ...props }) {
    return <Icon name="x-lg" {...props} />
}
