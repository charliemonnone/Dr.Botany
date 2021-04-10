export enum UIEvents {
	PLAY_GAME = "PLAY_GAME",
	CONTROLS = "CONTROLS",
	ABOUT = "ABOUT",
	MENU = "MENU",
	HIDE_LAYER = 'HIDE_LAYER',
	TRANSITION_SPLASH_SCREEN = 'TRANSITION_SPLASH_SCREEN',
	SHOW_MAIN_MENU = 'SHOW_MAIN_MENU',
	SHOW_MAIN_MENU_FINISHED = 'SHOW_MAIN_MENU_FINISHED',
	FIRST_RENDER = 'FIRST_RENDER',

	CLICKED_START = 'CLICKED_START',
	CLICKED_LEVEL_SELECT = 'CLICKED_LEVEL_SELECT',
	CLICKED_CONTROLS = 'CLICKED_CONTROLS', 
	CLICKED_OPTIONS = 'CLICKED_OPTIONS',
	CLICKED_HELP = 'CLICKED_HELP'
}

export enum UILayers {
	MAIN_MENU = "mainMenu",
	BACKGROUND = "background",
	SPLASH_SCREEN = "splashScreen",
	CONTROLS = "controls",
	LEVEL_SELECT = "levelSelect",
	OPTIONS = "options",
	HELP = "help",
}

export enum ButtonNames {
	START = "Start",
	LEVEL_SELECT = "Level Select",
	CONTROLS = "Controls",
	OPTIONS = "Options",
	HELP = "Help"
}