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

interface OptionsConfig {
	gridFSEnabled: boolean;
}

export interface Config {
	options: OptionsConfig;
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
