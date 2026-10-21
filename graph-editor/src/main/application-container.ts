import { ThemeServiceImpl } from "./components/themes/theme-service-impl"

const applicationContainer = {
    themeService: new ThemeServiceImpl()
}

export default applicationContainer;