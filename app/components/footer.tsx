import packageJson from "../../package.json";
export const Footer = () => {
	return (
		<footer className="bottom-0 w-full px-10 py-1 text-center text-white border-t border-solid bg-neutral-900 border-neutral-200">
			<span className="text-sm">© Copyright, 2024 MongoCarbon v{packageJson.version}</span>
		</footer>
	);
};
