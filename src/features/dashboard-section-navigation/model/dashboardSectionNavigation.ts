import { DashboardSectionIds } from '@/shared/config/navigation/dashboardSections';

export type DashboardSectionId = (typeof DashboardSectionIds)[keyof typeof DashboardSectionIds];

export const dashboardSectionIds: DashboardSectionId[] = [
  DashboardSectionIds.REPOSITORY,
  DashboardSectionIds.HEALTH_SCORE,
  DashboardSectionIds.METRICS,
  DashboardSectionIds.CHECKS,
  DashboardSectionIds.RECOMMENDATIONS,
];

const activationOffset = 160;
const pageTopClearOffset = 24;

export const getDashboardSectionHref = (sectionId: string) => {
  return `#${sectionId}`;
};

export const getDashboardSectionIdFromHash = (hash: string) => {
  return decodeURIComponent(hash.replace('#', ''));
};

export const isDashboardSectionId = (sectionId: string): sectionId is DashboardSectionId => {
  return dashboardSectionIds.includes(sectionId as DashboardSectionId);
};

export const getDashboardSectionUrl = (sectionId: string) => {
  return `${window.location.origin}${window.location.pathname}${window.location.search}${getDashboardSectionHref(sectionId)}`;
};

export const scrollToDashboardSection = (sectionId: string, behavior: ScrollBehavior) => {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior,
    block: 'start',
  });
};

export const navigateToDashboardSection = (href: string) => {
  const sectionId = href.startsWith('#') ? getDashboardSectionIdFromHash(href) : href;

  if (!isDashboardSectionId(sectionId)) {
    return;
  }

  const sectionHref = getDashboardSectionHref(sectionId);

  window.history.pushState(
    null,
    '',
    `${window.location.pathname}${window.location.search}${sectionHref}`,
  );

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToDashboardSection(sectionId, 'smooth');
    });
  });
};

const getDashboardSectionElements = () => {
  return dashboardSectionIds
    .map((sectionId) => document.getElementById(sectionId))
    .filter((section): section is HTMLElement => Boolean(section));
};

const isSectionVisible = (section: HTMLElement) => {
  const rect = section.getBoundingClientRect();

  return rect.bottom > 0 && rect.top < window.innerHeight;
};

export const getActiveDashboardSectionHash = () => {
  const sections = getDashboardSectionElements();

  if (sections.length === 0) {
    return '';
  }

  if (window.scrollY <= pageTopClearOffset) {
    return '';
  }

  const isPageBottom =
    Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2;

  if (isPageBottom) {
    const visibleSections = sections.filter(isSectionVisible);
    const lastVisibleSection = visibleSections[visibleSections.length - 1];

    return lastVisibleSection ? getDashboardSectionHref(lastVisibleSection.id) : '';
  }

  const crossedSections = sections.filter((section) => {
    const rect = section.getBoundingClientRect();

    return rect.top <= activationOffset;
  });

  const activeSection = crossedSections[crossedSections.length - 1];

  return activeSection ? getDashboardSectionHref(activeSection.id) : '';
};
