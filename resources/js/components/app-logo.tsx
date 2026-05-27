import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 shrink-0 min-w-8 items-center justify-center overflow-hidden">
                <img src="/images/sidebar-logo.png" className="size-full object-contain" alt="Logo Sidebar" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Kait Handmade</span>
            </div>
        </>
    );
}
