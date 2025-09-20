import packageJson from "../../package.json";
export const Footer = () => {
    return (
        <footer className="fixed bottom-0 right-0 z-50 w-full group ">
            <div className="px-5 py-1 text-center text-white transition translate-y-full border-t border-solid bg-neutral-900 border-neutral-200 group-hover:translate-y-0">
                <span className="text-sm">© Copyright, 2025 MongoCarbon v{packageJson.version}</span>
            </div>
        </footer>
    );
};
