import type { LicenseConfig } from "../types/licenseConfig";
import licenseData from "../data/license.json";

// 许可证配置（从 license.json 读取，可通过后台管理编辑）
export const licenseConfig: LicenseConfig = licenseData as LicenseConfig;
