import { ThemeServiceImpl } from "./theme-service-impl";
import { ThemeService } from "./theme-service.interface";

export const themeService: ThemeService = new ThemeServiceImpl();
