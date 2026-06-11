import type { ReportLocalizationCatalog } from './reportLocalizationCatalogTypes.js';
import type { SupportedLanguage } from '@frontend-radar/localization';

export const reportLocalizationProjectDetection = {
  en: {
    'project-build-script': {
      label: 'Build script',
      descriptions: {
        found: 'The selected package exposes a build script.',
        missing: 'The selected package does not expose a build script.',
      },
    },
    'project-frontend-dependency': {
      label: 'Frontend dependency',
      descriptions: {
        found: 'A common frontend dependency was found in package.json.',
        missing: 'No common frontend dependency was found in package.json.',
      },
    },
    'project-package-json': {
      label: 'Frontend package.json',
      descriptions: {
        found: 'package.json was found in the selected frontend folder.',
        missing: 'package.json was not found in the selected frontend folder.',
      },
    },
    'project-package-name': {
      label: 'Frontend package name',
      descriptions: {
        found: 'The package name looks like a frontend app.',
        missing: 'The package name does not include a common frontend hint.',
      },
    },
    'project-path-hint': {
      label: 'Frontend path hint',
      descriptions: {
        found: 'The selected path contains a common frontend folder name.',
        missing: 'The selected path does not contain a common frontend folder name.',
      },
    },
    'project-test-script': {
      label: 'Test script',
      descriptions: {
        found: 'The selected package exposes a test script.',
        missing: 'The selected package does not expose a test script.',
      },
    },
    'project-workspace': {
      label: 'Workspace match',
      descriptions: {
        found: 'The selected path matches a workspace entry from the root package.json.',
        missing: 'The selected path was not matched to a root workspace entry.',
      },
    },
  },
  ru: {
    'project-build-script': {
      label: 'Build-скрипт',
      descriptions: {
        found: 'В выбранном package.json есть build-скрипт.',
        missing: 'В выбранном package.json нет build-скрипта.',
      },
    },
    'project-frontend-dependency': {
      label: 'Frontend-зависимость',
      descriptions: {
        found: 'В package.json найдена распространённая frontend-зависимость.',
        missing: 'В package.json не найдена распространённая frontend-зависимость.',
      },
    },
    'project-package-json': {
      label: 'Frontend package.json',
      descriptions: {
        found: 'package.json найден в выбранной frontend-папке.',
        missing: 'package.json не найден в выбранной frontend-папке.',
      },
    },
    'project-package-name': {
      label: 'Название package',
      descriptions: {
        found: 'Название package похоже на frontend-приложение.',
        missing: 'Название package не содержит явный frontend-сигнал.',
      },
    },
    'project-path-hint': {
      label: 'Подсказка в пути',
      descriptions: {
        found: 'В выбранном пути есть распространённое название frontend-папки.',
        missing: 'В выбранном пути нет распространённого названия frontend-папки.',
      },
    },
    'project-test-script': {
      label: 'Test-скрипт',
      descriptions: {
        found: 'В выбранном package.json есть test-скрипт.',
        missing: 'В выбранном package.json нет test-скрипта.',
      },
    },
    'project-workspace': {
      label: 'Workspace',
      descriptions: {
        found: 'Выбранный путь совпадает с workspace из корневого package.json.',
        missing: 'Выбранный путь не совпал с workspace из корневого package.json.',
      },
    },
  },
} satisfies Record<SupportedLanguage, ReportLocalizationCatalog['projectDetection']>;
