import {
  dashboardSectionIds,
  getDashboardSectionHref,
  getDashboardSectionIdFromHash,
  type DashboardSectionId,
} from '@/shared/config/navigation/dashboardSections';

export { dashboardSectionIds, getDashboardSectionHref, getDashboardSectionIdFromHash };
export type { DashboardSectionId };

const activationOffset = 160;
const pageTopClearOffset = 24;

export const isDashboardSectionId = (sectionId: string): sectionId is DashboardSectionId => {
  return dashboardSectionIds.includes(sectionId as DashboardSectionId);
};

export const getDashboardSectionUrl = (sectionId: DashboardSectionId) => {
  return `${window.location.origin}${window.location.pathname}${window.location.search}${getDashboardSectionHref(sectionId)}`;
};

export const scrollToDashboardSection = (sectionId: string, behavior: ScrollBehavior) => {
  const section = document.getElementById(sectionId);

  if (!section) {
    return false;
  }

  section.scrollIntoView({
    behavior,
    block: 'start',
  });

  return true;
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
    const lastVisibleSectionId = lastVisibleSection?.id ?? '';

    return isDashboardSectionId(lastVisibleSectionId)
      ? getDashboardSectionHref(lastVisibleSectionId)
      : '';
  }

  const crossedSections = sections.filter((section) => {
    const rect = section.getBoundingClientRect();

    return rect.top <= activationOffset;
  });

  const activeSection = crossedSections[crossedSections.length - 1];
  const activeSectionId = activeSection?.id ?? '';

  return isDashboardSectionId(activeSectionId) ? getDashboardSectionHref(activeSectionId) : '';
};
