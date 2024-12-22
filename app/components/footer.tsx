import packageJson from "../../package.json";
export const Footer = () => {
	return (
		<footer className="fixed bottom-0 right-0 z-50 px-5 py-1 text-center text-white border-t border-solid rounded-tl-xl bg-neutral-900 border-neutral-200">
			<span className="text-sm">© Copyright, 2024 MongoCarbon v{packageJson.version}</span>
		</footer>
	);
};
