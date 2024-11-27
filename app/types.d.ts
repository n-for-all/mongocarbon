interface MongoDBConfig {
	allowDiskUse: boolean;
	connectionString: string;
	connectionOptions: {
		tls: boolean;
		tlsAllowInvalidCertificates: boolean;
		tlsCAFile?: string;
		tlsCertificateKeyFile?: string;
		tlsCertificateKeyFilePassword?: string;
		maxPoolSize: number;
	};
	whitelist: string[];
	blacklist: string[];
}

interface SiteConfig {
	host: string;
	port: number | string;
	requestSizeLimit: string;
	sslCert: string;
	sslEnabled: boolean;
	sslKey: string;
}

interface OptionsConfig {
	gridFSEnabled: boolean;
}

export interface Config {
	site: SiteConfig;
	options: OptionsConfig;
	rootPath: string;
}

export interface UserConnection {
	allowDiskUse: boolean;
	name: string;
	connectionString: string;
	tls: boolean;
	tlsAllowInvalidCertificates: boolean;
	tlsCAFile: string;
	tlsCertificateKeyFile: string;
	tlsCertificateKeyFilePassword: string;
	maxPoolSize: number;
	whitelist: string;
	blacklist: string;
}
