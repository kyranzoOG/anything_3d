import en from '../lang/en.json';

type Language = Record<string, string>;
export const data: Record<string, Language> = {
	en,
};

// @ts-ignore
const prerelease = appVersion.includes('-');

/**
 * Returns a translated string in the current language
 * @param string Translation key
 * @param variables Array of variables that replace anchors (%0, etc.) in the translation. Items can be strings or anything that can be converted to strings
 * @param default_value String value to default to if the translation is not available
 */
export const tl = function(string: string, variables?: string | number | (string|number)[], default_value?: string): string {
	if (string && string.length > 100) return string;
	var result = Language.data[string];
	if (prerelease && !result) {
		result = data.en[string];
	}
	if (result && result.length > 0) {
		if (variables) {
			if (variables instanceof Array == false) {
				variables = [variables];
			}
			var i = variables.length;
			while (i > 0) {
				i--;
				result = result.replace(new RegExp('%'+i, 'g'), variables[i])
			}
		}
		return result;
	} else if (default_value != undefined) {
		return default_value;
	} else {
		//console.warn('Unable to find translation for key', string);
		return string;
	}
}
export const translateUI = function() {
	$('.tl').each(function(i, obj) {
		var text = tl($(obj).text())
		$(obj).text(text)
	})
}

export const Language = {
	/**
	 * Translation data for the current language
	 */
	data: {},
	/**
	 * Language code indicating the currently selected language
	 */
	code: 'en',
	options: {
		en: 'English',
	},
	/**
	 * Add translations for custom translation strings
	 * @param language Two letter language code, e. G. 'en'
	 * @param strings Object listing the translation keys and values
	 */
	addTranslations(language: string, strings: Record<string, string>): void {
		for (var key in strings) {
			if (language == Language.code || (language == 'en' && Language.data[key] == undefined)) {
				Language.data[key] = strings[key];
			}
		}
	},
	toString: () => Language.code
}

Language.code = 'en';
document.body.parentElement.setAttribute('lang', 'en');
Language.data = data.en;

const global = {
	tl,
	Language
};
declare global {
	const Language: typeof global.Language
	const tl: typeof global.tl
}
Object.assign(window, global);
