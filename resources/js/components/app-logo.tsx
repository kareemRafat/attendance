export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <img src="/images/logo.webp" alt="Logo" className="size-8 rounded-md" />
            </div>
            <div className="ms-3 grid flex-1 text-start text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    نظام الحضور للطلاب
                </span>
            </div>
        </>
    );
}
