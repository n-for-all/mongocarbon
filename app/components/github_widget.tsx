import { ChevronDown, ChevronUp, Download, Fork, LogoGithub, Watch } from "@carbon/icons-react";
import React, { useEffect, useState } from "react";

interface GitHubRepo {
	watchers: number;
	forks: number;
	description: string;
	homepage: string;
	pushed_at: string;
	message?: string;
	_cachedAt?: number;
}

interface GitHubWidgetProps {
	repo: string;
	title: string;
	version: string;
	travis?: boolean;
}

export const GithubButton = ({ repo, version, title }) => {
	const [vendorName, repoName] = repo.split("/");
	const repoUrl = `http://github.com/${vendorName}/${repoName}`;
	return (
		<div className="inline-flex items-center">
			<a target="_blank" className="inline-flex w-9 overflow-hidden lg:w-auto items-center gap-2 px-2 py-1.5 text-sm border border-solid rounded-sm border-neutral-300 bg-neutral-50" href={repoUrl}>
				<LogoGithub className="flex-shrink-0 w-5 h-5" /> {title} {version ? <b>v{version}</b> : null}
			</a>
		</div>
	);
};

const GitHubWidget: React.FC<GitHubWidgetProps> = ({ repo, travis, title, version }) => {
	const [repoData, setRepoData] = useState<GitHubRepo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [vendorName, repoName] = repo.split("/");
	const vendorUrl = `http://github.com/${vendorName}`;
	const repoUrl = `http://github.com/${vendorName}/${repoName}`;
	const travisImgUrl = `https://travis-ci.org/${vendorName}/${repoName}.png?branch=master`;
	const travisUrl = `https://travis-ci.org/${vendorName}/${repoName}/builds`;
	const [expand, setExpand] = useState(false);

	useEffect(() => {
		const url = `https://api.github.com/repos/${repo}`;
		const fetchRepoData = async () => {
			try {
				const cachedData = localStorage.getItem(url);
				let elapsedMinutes;
				if (cachedData) {
					const cachedAtUnix = JSON.parse(cachedData)._cachedAt;
					const elapsed = new Date().getTime() - cachedAtUnix;
					elapsedMinutes = elapsed / 1000 / 60;
				}

				if (elapsedMinutes && elapsedMinutes < 20 && cachedData) {
					setRepoData(JSON.parse(cachedData));
					setLoading(false);
				} else {
					const response = await fetch(url);
					const data = await response.json();
					if (data.message && /Rate Limit/i.test(data.message)) {
						if (cachedData) {
							setRepoData(JSON.parse(cachedData));
						} else {
							setError("Rate limit exceeded");
						}
					} else {
						data._cachedAt = new Date().getTime();
						localStorage.setItem(url, JSON.stringify(data));
						setRepoData(data);
					}
					setLoading(false);
				}
			} catch (error) {
				setError("Failed to fetch repository data");
				setLoading(false);
			}
		};

		fetchRepoData();
	}, [repo]);

	if (error) {
		return <div className="text-red-500">{error}</div>;
	}

	if (!repoData) {
		return null;
	}

	const date = new Date(repoData.pushed_at);
	const pushedAt = `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;

	let output: any = null;
	if (loading) {
		output = <div>Loading...</div>;
	} else if (error) {
		output = <div className="text-red-500">{error}</div>;
	} else if (!repoData) {
		output = <div className="text-red-500">No data</div>;
	} else {
		output = (
			<div className={"overflow-hidden transition-all duration-500 " + (expand ? "max-h-48" : "max-h-0")}>
				<div className={"p-4 overflow-auto h-full  border border-solid rounded-md border-neutral-300 bg-neutral-50 "}>
					<div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-300">
						<h3 className="flex gap-0.5 font-semibold text-neutral-700 text-md">
							<LogoGithub className="w-6 h-6 mr-1" />
							<a className="text-blue-500" href={vendorUrl}>
								{vendorName}
							</a>
							/
							<a className="text-blue-500" href={repoUrl}>
								{repoName}
							</a>
						</h3>
						<div className="flex space-x-2">
							<a className="flex items-center gap-1 text-sm text-neutral-600 watchers" href={`${repoUrl}/watchers`}>
								<Watch />
								{repoData.watchers}
							</a>
							<a className="flex items-center gap-1 text-sm text-neutral-600 forks" href={`${repoUrl}/network/members`}>
								<Fork />
								{repoData.forks}
							</a>
						</div>
					</div>
					<div className="mb-2 ">
						<p className="text-sm text-neutral-700">
							{repoData.description} &mdash;{" "}
							<a className="text-blue-500" href={`${repoUrl}#readme`}>
								Read More
							</a>
						</p>
						{repoData.homepage && (
							<p className="text-sm">
								<a className="text-blue-500" href={repoData.homepage}>
									{repoData.homepage}
								</a>
							</p>
						)}
					</div>
					<div className="flex items-center justify-between pt-2 border-t border-neutral-300">
						<p className="text-sm text-neutral-600 updated">
							Latest commit to the <strong>master</strong> branch on {pushedAt}
						</p>
						<div className="flex items-center justify-start mt-2 ml-2 space-x-2">
							{travis && (
								<a href={travisUrl}>
									<img className="travis" src={travisImgUrl} alt="Build status" />
								</a>
							)}
							<a
								className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-solid rounded-sm text-neutral-700 border-neutral-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-200"
								href={`${repoUrl}/zipball/master`}>
								<Download />
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="inline-flex mb-4 border border-solid rounded-sm border-neutral-300 bg-neutral-50">
				<a target="_blank" className="inline-flex items-center gap-2 px-2 py-1 my-1 text-sm " href={repoUrl}>
					<LogoGithub className="w-6 h-6" /> {title} <b>v{version}</b>
				</a>
				<a
					onClick={(e) => {
						e.preventDefault();
						setExpand(!expand);
					}}
					className="inline-flex items-center gap-2 px-2 py-1 my-1 ml-2 text-sm border-l border-solid border-neutral-200"
					href={repoUrl}>
					{expand ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
				</a>
			</div>
			{output}
		</>
	);
};

export default GitHubWidget;
