/*
 * Continuing education cabinet, independent of Bookshelf.
 * Data: assets/learning-courses.json; styles: assets/style.css.
 */
const LearningCabinet = {
  element(tag, className = '', value = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  },

  typeLabel(type) {
    return ({
      course: 'Course',
      certification: 'Certification',
      'self-study': 'Self-directed study'
    })[type] || 'Learning record';
  },

  statusLabel(status) {
    return ({
      completed: 'Completed',
      finished: 'Completed',
      'in-progress': 'In progress',
      planned: 'Planned',
      partial: 'Partially completed'
    })[status] || '';
  },

  render(courses) {
    const target = document.getElementById('course-entries');
    if (!target) return;

    // Close the details dialog when the user clicks its backdrop.
    const dialog = document.getElementById('course-details');

    if (dialog) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;

        const bounds = dialog.getBoundingClientRect();

        const clickedOutside =
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom;

        if (clickedOutside) {
          dialog.close();
        }
      });
    }


    target.replaceChildren();

    if (!courses.length) {
      target.append(
        this.element('p', 'learning-empty', 'No learning records yet.')
      );
      return;
    }

    // Preserve first-seen category order. No hardcoded folder list.
    const groups = new Map();

    for (const course of courses) {
      const category = String(
        course.category || 'Other Learning'
      ).trim() || 'Other Learning';

      if (!groups.has(category)) {
        groups.set(category, []);
      }

      groups.get(category).push(course);
    }

    const cabinet = this.element('div', 'learning-cabinet');
    cabinet.setAttribute('aria-label', 'Learning categories');

    // The stylesheet uses the number of folders to keep the
    // nameplate centered in the unused area to their right.
    cabinet.style.setProperty('--folder-count', groups.size);

    /*
     * This label appears when all folders are closed.
     * It is decorative and does not intercept mouse clicks.
     */
    const nameplateArea = this.element(
      'div',
      'learning-cabinet__nameplate-area'
    );

    nameplateArea.setAttribute('aria-hidden', 'true');

    const nameplate = this.element(
      'div',
      'learning-cabinet__nameplate'
    );

    nameplate.append(
      this.element(
        'span',
        'learning-cabinet__nameplate-title',
        'Learning Archive'
      ),
      this.element(
        'span',
        'learning-cabinet__nameplate-subtitle',
        'Select a folder to explore'
      )
    );

    nameplateArea.append(nameplate);

    let openFolder = null;
    let index = 0;

    for (const [category, records] of groups) {
      const folder = this.element('section', 'learning-folder');
      const panelId = `learning-folder-${index++}`;

      const toggle = this.element(
        'button',
        'learning-folder__tab'
      );

      toggle.type = 'button';
      toggle.setAttribute('aria-controls', panelId);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute(
        'aria-label',
        `${category}, ${records.length} ${records.length === 1 ? 'record' : 'records'}`
      );

      /*
       * The record count is generated from the category's data.
       * It does not represent completed courses or certifications.
       */
      const indicatorGroup = this.element(
        'span',
        'learning-folder__indicators'
      );

      const countBadge = this.element(
        'span',
        'learning-folder__record-badge',
        String(records.length)
      );

      countBadge.setAttribute('aria-hidden', 'true');
      indicatorGroup.append(countBadge);

      const label = this.element(
        'span',
        'learning-folder__tab-text',
        category
      );

      toggle.append(indicatorGroup, label);

      const panel = this.element('div', 'learning-folder__panel');
      panel.id = panelId;
      panel.hidden = true;

      panel.append(
        this.element('h3', 'learning-folder__heading', category),
        this.element(
          'p',
          'learning-folder__count',
          `${records.length} learning ${records.length === 1 ? 'record' : 'records'}`
        )
      );

      const list = this.element('div', 'learning-folder__records');

      for (const record of records) {
        const entry = this.element('button', 'learning-record');
        entry.type = 'button';

        entry.append(
          this.element(
            'span',
            'learning-record__title',
            record.title || 'Untitled'
          ),
          this.element(
            'span',
            'learning-record__meta',
            [
              record.provider || record.author,
              this.typeLabel(record.type),
              this.statusLabel(record.status)
            ].filter(Boolean).join(' · ')
          )
        );

        if (record.progressNote) {
          entry.append(
            this.element(
              'span',
              'learning-record__note',
              record.progressNote
            )
          );
        } else if (Number.isFinite(record.progress)) {
          entry.append(
            this.element(
              'span',
              'learning-record__note',
              `${record.progress}% complete`
            )
          );
        }

        entry.addEventListener(
          'click',
          () => this.showDetails(record)
        );

        list.append(entry);
      }

      panel.append(list);
      folder.append(toggle, panel);
      cabinet.append(folder);

      // Only one folder is open. Clicking it again closes it.
      toggle.addEventListener('click', () => {
        const alreadyOpen = openFolder === folder;

        if (openFolder) {
          openFolder.classList.remove('is-open');

          openFolder.querySelector(
            '.learning-folder__tab'
          ).setAttribute('aria-expanded', 'false');

          openFolder.querySelector(
            '.learning-folder__panel'
          ).hidden = true;
        }

        openFolder = alreadyOpen ? null : folder;

        if (openFolder) {
          folder.classList.add('is-open');
          toggle.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
          panel.scrollTop = 0;
        }

        // Hide the label when any folder is open.
        // Restore it when all folders are closed.
        cabinet.classList.toggle(
          'has-open-folder',
          Boolean(openFolder)
        );
      });
    }

    cabinet.append(nameplateArea);
    target.append(cabinet);
  },

  showDetails(record) {
    const dialog = document.getElementById('course-details');
    const content = document.getElementById('course-details-content');

    if (!dialog || !content) return;

    content.replaceChildren();

    const title = this.element(
      'h2',
      'bookshelf-dialog__title',
      record.title || 'Untitled'
    );

    title.id = 'course-details-title';
    title.tabIndex = -1;

    content.append(
      this.element(
        'p',
        'eyebrow',
        record.category || 'Continuing education'
      ),
      title
    );

    const meta = [
      record.provider || record.author,
      this.typeLabel(record.type),
      this.statusLabel(record.status),
      record.date
    ].filter(Boolean);

    if (meta.length) {
      content.append(
        this.element(
          'p',
          'bookshelf-dialog__meta',
          meta.join(' · ')
        )
      );
    }

    if (Number.isFinite(record.progress)) {
      content.append(
        this.element(
          'p',
          'learning-course-progress',
          `${record.progress}% complete`
        )
      );
    }

    if (record.progressNote) {
      content.append(
        this.element(
          'p',
          'learning-course-progress',
          record.progressNote
        )
      );
    }

    const about = this.element(
      'section',
      'bookshelf-dialog__section'
    );

    about.append(
      this.element('h3', '', 'About this learning record')
    );

    about.append(
      this.element(
        'p',
        '',
        record.summary?.trim() || 'Description to be added.'
      )
    );

    content.append(about);

    const reflection = this.element(
      'section',
      'bookshelf-dialog__section'
    );

    reflection.append(
      this.element('h3', '', 'My reflections')
    );

    const reflectionText = this.element(
      'p',
      'bookshelf-dialog__reflection',
      record.reflection?.trim() ||
        'Personal reflection coming soon.'
    );

    if (!record.reflection?.trim()) {
      reflectionText.classList.add(
        'bookshelf-dialog__reflection--empty'
      );
    }

    reflection.append(reflectionText);
    content.append(reflection);

    for (const [field, label] of [
      ['url', 'View course or documentation'],
      ['credentialUrl', 'Verify credential']
    ]) {
      if (
        typeof record[field] !== 'string' ||
        !/^https:\/\//i.test(record[field])
      ) {
        continue;
      }

      const link = this.element('a', 'text-link', label);
      link.href = record[field];
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      content.append(link);
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    // Avoid automatic focus on the Close button, which can
    // cause a long dialog to open scrolled to the bottom.
    title.focus({ preventScroll: true });
    dialog.scrollTop = 0;

    requestAnimationFrame(() => {
      dialog.scrollTop = 0;
    });
  },

  async init() {
    const target = document.getElementById('course-entries');
    if (!target) return;

    try {
      const response = await fetch('assets/learning-courses.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data.courses)) {
        throw new Error('Expected a courses array.');
      }

      this.render(data.courses);
    } catch (error) {
      console.error('Unable to load continuing education:', error);

      target.replaceChildren(
        this.element(
          'p',
          'learning-error',
          'The learning cabinet could not load. Check assets/learning-courses.json and use a local web server.'
        )
      );
    }
  }
};

LearningCabinet.init();