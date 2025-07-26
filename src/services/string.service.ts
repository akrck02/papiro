import PathService from "./path.service.js";

export default class StringService {
	static readonly DEFAULT_TOLERANCE = 2;

	static levenshteinDistance(a: string, b: string) {
		const an = a.length;
		const bn = b.length;
		if (an == 0) {
			return bn;
		}
		if (bn == 0) {
			return an;
		}
		const matrix = new Array<number[]>(bn + 1);
		for (let i = 0; i <= bn; ++i) {
			const row = (matrix[i] = new Array<number>(an + 1));
			row[0] = i;
		}
		const firstRow = matrix[0];
		for (let j = 1; j <= an; ++j) {
			firstRow![j] = j;
		}
		for (let i = 1; i <= bn; ++i) {
			for (let j = 1; j <= an; ++j) {
				if (b.charAt(i - 1) === a.charAt(j - 1)) {
					matrix[i]![j] = matrix[i - 1]![j - 1]!;
				} else {
					matrix[i]![j] =
						Math.min(
							matrix[i - 1]![j - 1]!, // substitution
							matrix[i]![j - 1]!, // insertion
							matrix[i - 1]![j]!, // deletion
						) + 1;
				}
			}
		}
		return matrix[bn]![an]!;
	}

	/**
	 * Get if the text contains the searcher with typo tolerance
	 * @param text The text to search in
	 * @param query The text to search for
	 * @returns True if the text contains the searcher
	 */
	static search(text: string, query: string): boolean {
		return StringService.searchWithTolerance(
			text,
			query,
			StringService.DEFAULT_TOLERANCE,
		);
	}

	/**
	 * Get if the text contains the searcher with typo tolerance
	 * @param text The text to search in
	 * @param query The text to search for
	 * @param tolerance The tolerance to use
	 * @returns True if the text contains the searcher
	 */
	static containsMatchingWordWithTolerance(
		text: string,
		query: string,
		tolerance: number,
	): boolean {
		text = PathService.decodeCustomUrl(
			StringService.normalized(text.trim().replaceAll(" ", "").toUpperCase()),
		).toUpperCase();
		query = StringService.normalized(
			query.trim().replaceAll(" ", "").toUpperCase(),
		).toUpperCase();

		if (text == query || text.includes(query)) return true;
		if (StringService.levenshteinDistance(query, text) < tolerance) return true;

		let matchesTolerance = false;
		const words = text.split(/\s/);
		for (const word of words) {
			if (StringService.levenshteinDistance(query, word) < tolerance) {
				return true;
			}
		}

		return matchesTolerance;
	}

	/**
	 * Get if the text contains the searcher with typo tolerance
	 * @param text The text to search in
	 * @param query The text to search for
	 * @param tolerance The tolerance to use
	 * @returns True if the text contains the searcher
	 */
	static searchWithTolerance(
		text: string,
		query: string,
		tolerance: number,
	): boolean {
		text = text.trim();
		query = query.trim();

		if (text.toUpperCase().includes(query.toUpperCase())) {
			return true;
		}

		const words = query.split(/\s/);
		let matching = words.some((word) =>
			this.containsMatchingWordWithTolerance(text, word, tolerance),
		);

		return matching;
	}

	/**
	 * Returns a word matching with typo tolerance
	 * @param text The text to search in
	 * @param query The word to search for
	 * @param tolerance The tolerance to use
	 * @return
	 */
	public static getMatching(
		text: string,
		query: string,
		tolerance: number,
	): string[] {
		text = text.trim();
		query = query.trim();

		const matches: string[] = [];

		if (text.toUpperCase().includes(query.toUpperCase())) {
			matches.push(query);
			return matches;
		}

		const words = text.split(/\s/);
		words.forEach((word) => {
			const matching = this.getMatchingWord(text, word, tolerance);
			if (matching != null) {
				matches.push(matching);
			}
		});

		return matches;
	}

	/**
	 * Returns a word matching with typo tolerance
	 * @param text The text to search in
	 * @param searcher The word to search for
	 * @param tolerance The tolerance to use
	 * @return
	 */
	public static getMatchingWord(
		text: string,
		searcher: string,
		tolerance: number,
	): string {
		const words = text.split(/\s/);
		let matchingWord = "";
		words.find(
			(word) =>
				StringService.normalized(word)
					.toUpperCase()
					.includes(searcher.toUpperCase()) ||
				StringService.levenshteinDistance(
					StringService.normalized(searcher).toUpperCase(),
					StringService.normalized(word).toUpperCase(),
				) < tolerance,
		);

		return matchingWord;
	}

	/**
	 * Get normalized text (no accents)
	 * @param text
	 * @return the text without accents
	 */
	static normalized(text: string): string {
		const sensible = [
			"\u00C1",
			"\u00C9",
			"\u00CD",
			"\u00D3",
			"\u00DA",
			"\u00D1",

			"\u00E1",
			"\u00E9",
			"\u00ED",
			"\u00F3",
			"\u00FA",
			"\u00F1",
		];
		const normalized = [
			"A",
			"E",
			"I",
			"O",
			"U",
			"N",
			"a",
			"e",
			"i",
			"o",
			"u",
			"n",
		];

		for (let i = 0; i < normalized.length; i++) {
			text = text.replaceAll(sensible[i], normalized[i]);
		}

		return text;
	}
}
