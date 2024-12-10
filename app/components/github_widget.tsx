import React, { useEffect, useState } from "react";

const ChevronUp = ({ className }) => (
	<svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M7 14.5L12 9.5L17 14.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);
const ChevronDown = ({ className }) => (
	<svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M17 9.5L12 14.5L7 9.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);
const Download = () => (
	<svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
		<path d="M26 24v4H6v-4H4v6h24v-6zM16 22l7-7-1.4-1.4-4.6 4.6V4h-2v14.2l-4.6-4.6L9 15z" />
	</svg>
);
const Fork = ({ className }) => (
	<svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
		<path d="M4.603 5.347l5.653 7.11a10.347 10.347 0 0 1 .477-1.022L5.397 4.741zM18.244 5H15V4h5v5h-1V5.656l-4.872 5.265A7.91 7.91 0 0 0 12 16.294V21h-1v-4.706a8.908 8.908 0 0 1 2.394-6.051z" />
		<path fill="none" d="M0 0h24v24H0z" />
	</svg>
);
const LogoGithub = ({ className }) => (
	<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
		<path d="M16 2.05a14 14 0 0 0-4.42 27.26c.7.13.96-.3.96-.66v-2.34c-3.9.85-4.72-1.88-4.72-1.88a3.72 3.72 0 0 0-1.56-2.05c-1.28-.88.1-.86.1-.86a2.94 2.94 0 0 1 2.14 1.44 3 3 0 0 0 4.1 1.17 3 3 0 0 1 .9-1.88c-3.11-.35-6.38-1.55-6.38-6.9a5.4 5.4 0 0 1 1.44-3.74 5 5 0 0 1 .14-3.68s1.17-.37 3.84 1.43a13.2 13.2 0 0 1 7 0c2.67-1.8 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.68 5.4 5.4 0 0 1 1.44 3.74c0 5.36-3.28 6.55-6.4 6.9a3.36 3.36 0 0 1 1 2.61v3.87c0 .36.26.8 1 .66A14 14 0 0 0 16 2.05z" />
	</svg>
);
const Watch = ({ className }) => (
	<svg className={className} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none">
		<path stroke="currentColor" strokeLinejoin="round" strokeWidth={1.5} d="M29 16c0 3-5.82 9-13 9S3 19 3 16s5.82-9 13-9 13 6 13 9z" />
		<circle cx={16} cy={16} r={5} stroke="currentColor" strokeLinejoin="round" strokeWidth={1.5} />
	</svg>
);

const Star = ({ className }) => (
	<svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M14.65 8.93274L12.4852 4.30901C12.2923 3.89699 11.7077 3.897 11.5148 4.30902L9.35002 8.93274L4.45559 9.68243C4.02435 9.74848 3.84827 10.2758 4.15292 10.5888L7.71225 14.2461L6.87774 19.3749C6.80571 19.8176 7.27445 20.1487 7.66601 19.9317L12 17.5299L16.334 19.9317C16.7256 20.1487 17.1943 19.8176 17.1223 19.3749L16.2878 14.2461L19.8471 10.5888C20.1517 10.2758 19.9756 9.74848 19.5444 9.68243L14.65 8.93274Z"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

interface Owner {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: string;
	site_admin: boolean;
}

interface License {
	key: string;
	name: string;
	spdx_id: string;
	url: string;
	node_id: string;
}

interface GitHubRepo {
	id: number;
	node_id: string;
	name: string;
	full_name: string;
	private: boolean;
	owner: Owner;
	html_url: string;
	description: string;
	fork: boolean;
	url: string;
	forks_url: string;
	keys_url: string;
	collaborators_url: string;
	teams_url: string;
	hooks_url: string;
	issue_events_url: string;
	events_url: string;
	assignees_url: string;
	branches_url: string;
	tags_url: string;
	blobs_url: string;
	git_tags_url: string;
	git_refs_url: string;
	trees_url: string;
	statuses_url: string;
	languages_url: string;
	stargazers_url: string;
	contributors_url: string;
	subscribers_url: string;
	subscription_url: string;
	commits_url: string;
	git_commits_url: string;
	comments_url: string;
	issue_comment_url: string;
	contents_url: string;
	compare_url: string;
	merges_url: string;
	archive_url: string;
	downloads_url: string;
	issues_url: string;
	pulls_url: string;
	milestones_url: string;
	notifications_url: string;
	labels_url: string;
	releases_url: string;
	deployments_url: string;
	created_at: string;
	updated_at: string;
	pushed_at: string;
	git_url: string;
	ssh_url: string;
	clone_url: string;
	svn_url: string;
	homepage: string | null;
	size: number;
	stargazers_count: number;
	watchers_count: number;
	language: string;
	has_issues: boolean;
	has_projects: boolean;
	has_downloads: boolean;
	has_wiki: boolean;
	has_pages: boolean;
	has_discussions: boolean;
	forks_count: number;
	mirror_url: string | null;
	archived: boolean;
	disabled: boolean;
	open_issues_count: number;
	license: License;
	allow_forking: boolean;
	is_template: boolean;
	web_commit_signoff_required: boolean;
	topics: string[];
	visibility: string;
	forks: number;
	open_issues: number;
	watchers: number;
	default_branch: string;
	temp_clone_token: string | null;
	network_count: number;
	subscribers_count: number;
	_cachedAt: number;
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
			<a
				target="_blank"
				className="inline-flex w-9 overflow-hidden lg:w-auto items-center gap-2 px-2 py-1.5 text-sm border border-solid rounded-sm border-neutral-300 bg-neutral-50"
				href={repoUrl}>
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
					<div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2">
						<h3 className="flex gap-0.5 font-semibold text-neutral-600 text-md">
							<LogoGithub className="w-6 h-6 mr-1" />
							<a className="text-blue-500" href={vendorUrl}>
								{vendorName}
							</a>
							/
							<a className="text-blue-500" href={repoUrl}>
								{repoName}
							</a>
						</h3>
						<div className="flex gap-3">
							<a
								target="_blank"
								className="flex items-center text-sm font-bold transition text-neutral-600 watchers hover:text-blue-600"
								href={`${repoUrl}/watchers`}>
								<Watch className="h-5 mr-1" />
								{repoData.watchers}
							</a>
							<a target="_blank" className="flex items-center text-sm font-bold transition text-neutral-600 watchers hover:text-blue-600" href={`${repoUrl}/fork`}>
								<Fork className="h-5 mr-0.5" />
								{repoData.forks}
							</a>
							<a
								target="_blank"
								className="flex items-center text-sm font-bold transition text-neutral-600 watchers hover:text-blue-600"
								href={`${repoUrl}/stargazers`}>
								<Star className="h-5" />
								{repoData.stargazers_count}
							</a>
						</div>
					</div>
					<div className="mb-2 ">
						<p className="text-sm text-neutral-600">
							{repoData.description}
							<span className="block">
								&mdash;{" "}
								<a target="_blank" className="text-blue-500" href={`${repoUrl}#readme`}>
									Read More
								</a>
							</span>
						</p>
						{repoData.homepage && (
							<p className="text-sm">
								<a target="_blank" className="text-blue-500" href={repoData.homepage}>
									{repoData.homepage}
								</a>
							</p>
						)}
					</div>
					<div className="flex items-center justify-between pt-2">
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
								className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-solid rounded-sm text-neutral-600 border-neutral-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-200"
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
					{expand ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
				</a>
			</div>
			{output}
		</>
	);
};

export default GitHubWidget;
