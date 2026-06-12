import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationErrors = {
  en: {
    analysis_failed: 'Repository analysis failed.',
    branch_not_found: 'GitHub branch not found.',
    github_rate_limited: 'GitHub API rate limit exceeded. Try again later.',
    github_unavailable: 'GitHub is unavailable right now. Try again later.',
    project_path_not_found: 'Frontend package.json was not found in the selected path.',
    repository_forbidden: 'GitHub repository is private or access is forbidden.',
    repository_not_found: 'GitHub repository not found',
    repository_verification_failed: 'GitHub repository could not be verified.',
  },
  ru: {
    analysis_failed: 'Не удалось проанализировать репозиторий.',
    branch_not_found: 'Ветка GitHub не найдена.',
    github_rate_limited: 'Превышен лимит запросов к GitHub. Попробуйте позже.',
    github_unavailable: 'GitHub сейчас недоступен. Попробуйте позже.',
    project_path_not_found: 'В указанной папке frontend не найден package.json.',
    repository_forbidden: 'Репозиторий приватный или доступ к нему запрещён.',
    repository_not_found: 'Репозиторий GitHub не найден.',
    repository_verification_failed: 'Не удалось проверить репозиторий GitHub.',
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['errors']>;
