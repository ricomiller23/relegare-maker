export class Generator {
    constructor(templateHtml) {
        this.template = templateHtml;
    }

    generate(selectedReligions) {
        let html = this.template;

        selectedReligions.forEach((rel, index) => {
            const letter = ['A', 'B', 'C'][index];
            const prefix = `{{RELIGION_${letter}_`;

            // Basic Info
            html = html.replaceAll(`${prefix}NAME}}`, rel.name);
            html = html.replaceAll(`${prefix}ICON}}`, rel.icon);
            html = html.replaceAll(`${prefix}COLOR}}`, this.getColorHex(rel.color));

            // Religare Fields
            const fields = [
                'TIME_PLACE', 'FOUNDER', 'SACRED_TEXT', 'ORIGIN_CULTURE',
                'CREATION_MYTH', 'CORE_BELIEFS', 'FUNCTIONAL_PURPOSE',
                'POWER_STRUCTURE', 'RELIGIOUS_LINEAGE', 'RELEVANCE_LEGACY'
            ];

            fields.forEach(field => {
                const key = this.snakeToCamel(field);
                html = html.replaceAll(`${prefix}DATA_${field}}}`, rel.data[key]);
            });

            // Practicum
            for (let i = 1; i <= 5; i++) {
                const roman = ['I', 'II', 'III', 'IV', 'V'][i - 1];
                html = html.replaceAll(`${prefix}PRACTICUM_${roman}}}`, rel.data.practicum[roman]);
            }
        });

        // Generate Quiz JSON
        const allQuiz = selectedReligions.flatMap(r => r.quiz || []);
        html = html.replaceAll('{{QUIZ_JSON}}', JSON.stringify(allQuiz));

        // Generate Flashcards JSON
        const allFlashcards = selectedReligions.flatMap(r => r.flashcards || []);
        html = html.replaceAll('{{FLASHCARDS_JSON}}', JSON.stringify(allFlashcards));

        return html;
    }

    getColorHex(name) {
        const colors = {
            'blue': '#3B82F6',
            'fire': '#E67E22',
            'primary': '#27AE60',
            'gold': '#D4AF37',
            'red': '#E74C3C',
            'rose': '#E91E63'
        };
        return colors[name] || '#1A1A1A';
    }

    snakeToCamel(str) {
        return str.toLowerCase().replace(/([-_][a-z])/g, group =>
            group.toUpperCase().replace('-', '').replace('_', '')
        );
    }
}
