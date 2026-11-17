/*
 * Learning page: generated bookcase only.
 * Books are loaded from asset/learning-books.json.
 * Colors, size, and tilt are deterministic for each book.
 */
const Bookshelf = {
  categories: [
    { key: 'professional', title: 'Professional & Technical' },
    { key: 'personal', title: 'Personal Development & Philosophy' },
    { key: 'fiction', title: 'Fiction & Literature' }
  ],

  palettes: {
    professional: ['#416f76', '#69878b', '#456473', '#637b72', '#586c85', '#826d71', '#3d6f70', '#7d8068'],
    personal: ['#698a82', '#72838b', '#8a787e', '#758c79', '#6a7d87', '#927d70', '#598680'],
    fiction: ['#485f70', '#6b657f', '#806e70', '#536d76', '#747c75', '#675e74', '#527b7d', '#88766e']
  },

  books: [],
  container: null,
  dialog: null,
  measureContext: null,
  lastWidth: 0,
  resizeObserver: null,

  element(tag, className = '', value = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  },

  hash(value) {
    let result = 2166136261;

    for (const character of value) {
      result = Math.imul(
        result ^ character.charCodeAt(0),
        16777619
      );
    }

    return result >>> 0;
  },

  textWidth(value, fontSize) {
    if (!this.measureContext) {
      return value.length * fontSize * 0.75;
    }

    this.measureContext.font = `700 ${fontSize}px Georgia`;
    return this.measureContext.measureText(value).width;
  },

  statusLabel(status) {
    switch (status) {
      case 'reading': return 'Currently reading';
      case 'in-progress': return 'In progress';
      case 'partial': return 'Partially completed';
      case 'completed':
      case 'finished': return 'Completed';
      default: return '';
    }
  },

  createSpine(book, category) {
    const title = String(book.title || 'Untitled');
    const id = `${category}:${title}:${book.author || ''}`;
    const seed = this.hash(id);
    const fontSize =
      title.length > 22 ? 8 :
      title.length > 15 ? 9 : 10;

    // The title is never shortened or set below 8px.
    // Allow extra room for the binding bands, bookmark,
    // and top/bottom whitespace.
    const titleWidth = this.textWidth(title, fontSize);

    const height = Math.max(
      116,
      Math.ceil(titleWidth + 64 + ((seed >>> 8) % 12))
    );

    const width = 27 + ((seed >>> 5) % 13);

    const inclination = (seed >>> 16) % 8 === 0
      ? ((seed >>> 18) % 2 ? -3 : 3)
      : (seed >>> 19) % 7 === 0 ? 1 : 0;

    const reading =
      book.status === 'reading' ||
      book.status === 'in-progress';

    const button = this.element('button', 'bookshelf-book');
    button.type = 'button';

    button.classList.toggle('is-reading', reading);

    button.style.setProperty(
      '--book-color',
      this.palettes[category][
        seed % this.palettes[category].length
      ]
    );

    button.style.setProperty(
      '--book-tilt',
      `${inclination}deg`
    );

    button.style.setProperty(
      '--book-font-size',
      `${fontSize}px`
    );

    button.style.width = `${width}px`;
    button.style.height = `${height}px`;
    button.title = title;

    button.setAttribute(
      'aria-label',
      `${title}${book.author ? ` by ${book.author}` : ''}${reading ? ', currently reading' : ''}`
    );

    if (reading) {
      const bookmark = this.element(
        'span',
        'bookshelf-book__bookmark'
      );

      bookmark.setAttribute('aria-hidden', 'true');
      button.append(bookmark);
    }

    const spine = this.element(
      'span',
      'bookshelf-book__spine',
      title
    );

    spine.setAttribute('aria-hidden', 'true');
    button.append(spine);

    button.addEventListener(
      'click',
      () => this.showDetails(book, category)
    );

    return { button, width, height };
  },

  // Grouping rules:
  // 1. Series books stay together, sorted by seriesOrder.
  // 2. Only books without a series are grouped by their author.
  // 3. An optional authorGroup can identify a coauthor or pen name.
  // 4. Groups keep the position of their first book in the JSON.
  groupBooks(entries) {
    const groups = [];
    const knownGroups = new Map();

    for (const book of entries) {
      const series = typeof book.series === 'string'
        ? book.series.trim()
        : '';

      const author = typeof book.author === 'string'
        ? book.author.trim()
        : '';

      const override = typeof book.authorGroup === 'string'
        ? book.authorGroup.trim()
        : '';

      // Do not automatically treat a comma-separated list
      // of coauthors as a single author.
      const singleAuthor =
        author && !/[,;]|\s(?:and|&)\s/i.test(author);

      const authorName =
        override || (singleAuthor ? author : '');

      const type = series
        ? 'series'
        : authorName
          ? 'author'
          : '';

      const name = series || authorName;

      if (!type) {
        groups.push({
          type: '',
          name: '',
          books: [book]
        });
        continue;
      }

      // Prefix keys so author and series names cannot conflict.
      const key = `${type}:${name.toLocaleLowerCase()}`;
      let group = knownGroups.get(key);

      if (!group) {
        group = {
          type,
          name,
          books: []
        };

        knownGroups.set(key, group);
        groups.push(group);
      }

      group.books.push(book);
    }

    for (const group of groups) {
      if (group.type !== 'series') continue;

      // A stable sort keeps the JSON order for equal values.
      group.books.sort((first, second) => {
        const a = Number.isFinite(first.seriesOrder)
          ? first.seriesOrder
          : Infinity;

        const b = Number.isFinite(second.seriesOrder)
          ? second.seriesOrder
          : Infinity;

        return a - b;
      });
    }

    return groups;
  },

  // Plaques are added after books enter the DOM.
  // Their positions come from rendered book coordinates.
  // Long groups can receive one plaque on each occupied shelf.
  addGroupPlaques(plank, rowBooks) {
    const plankRect = plank.getBoundingClientRect();
    let index = 0;

    while (index < rowBooks.length) {
      const current = rowBooks[index];
      let next = index + 1;

      while (
        next < rowBooks.length &&
        rowBooks[next].type === current.type &&
        rowBooks[next].name === current.name &&
        current.type
      ) {
        next += 1;
      }

      // No plaques for single books or groups of one.
      if (current.type && current.groupSize > 1) {
        const firstRect =
          current.button.getBoundingClientRect();

        const lastRect =
          rowBooks[next - 1].button.getBoundingClientRect();

        const left = Math.max(
          0,
          firstRect.left - plankRect.left
        );

        const right = Math.min(
          plankRect.width,
          lastRect.right - plankRect.left
        );

        const width = Math.max(0, right - left);

        if (width > 0) {
          const plaque = this.element(
            'span',
            `bookshelf-group-plaque bookshelf-group-plaque--${current.type}`,
            current.name
          );

          plaque.title = current.name;
          plaque.setAttribute('aria-hidden', 'true');
          plaque.style.left = `${left}px`;
          plaque.style.width = `${width}px`;

          plank.append(plaque);
        }
      }

      index = next;
    }
  },

  render() {
    if (!this.container) return;

    const caseNode = this.element('div', 'bookshelf-case');
    const renderedSections = [];

    for (const { key, title } of this.categories) {
      const section = this.element(
        'section',
        `bookshelf-section bookshelf-section--${key}`
      );

      section.setAttribute('aria-label', title);

      const entries = this.books.filter(
        book => book.category === key
      );

      const label = this.element(
        'div',
        'bookshelf-section__label'
      );

      label.append(
        this.element(
          'h3',
          'bookshelf-section__title',
          title
        ),
        //this allows for counting of books in a category.
        // this.element(
        //   'span',
        //   'bookshelf-section__count',
        //   `${entries.length} ${entries.length === 1 ? 'book' : 'books'}`
        // )
      );

      section.append(label);

      const rows = this.element(
        'div',
        'bookshelf-section__rows'
      );

      section.append(rows);
      caseNode.append(section);

      renderedSections.push({
        rows,
        entries,
        category: key
      });
    }

    caseNode.append(
      this.element('div', 'bookshelf-case__base')
    );

    this.container.replaceChildren(caseNode);

    for (const {
      rows,
      entries,
      category
    } of renderedSections) {
      let line = null;
      let plank = null;
      let consumed = 0;
      let tallest = 0;
      let capacity = 0;
      let rowBooks = [];

      const completeRows = [];

      const addRow = () => {
        const row = this.element('div', 'bookshelf-row');

        line = this.element(
          'div',
          'bookshelf-row__books'
        );

        plank = this.element(
          'div',
          'bookshelf-row__plank'
        );

        row.append(line, plank);
        rows.append(row);

        // Each row has a separate book list for plaque placement.
        rowBooks = [];

        completeRows.push({
          plank,
          books: rowBooks
        });

        capacity = line.clientWidth;
        consumed = 0;
        tallest = 0;
      };

      if (!entries.length) {
        addRow();

        line.append(
          this.element(
            'span',
            'bookshelf-row__empty',
            'No books in this collection yet.'
          )
        );
      }

      const groups = this.groupBooks(entries);

      for (const group of groups) {
        const items = group.books.map(book => ({
          book,
          ...this.createSpine(book, category)
        }));

        // The extra 9px reserves space for gaps and book tilt.
        const groupWidth = items.reduce(
          (sum, item) => sum + item.width + 9,
          0
        );

        if (!line) addRow();

        // Keep a short group on one shelf when possible.
        if (
          group.type &&
          group.books.length > 1 &&
          consumed > 0 &&
          groupWidth <= capacity &&
          consumed + groupWidth > capacity
        ) {
          addRow();
        }

        for (const item of items) {
          const occupiedWidth = item.width + 9;

          // Longer groups continue on the next shelf.
          if (
            consumed > 0 &&
            consumed + occupiedWidth > capacity
          ) {
            addRow();
          }

          line.append(item.button);

          rowBooks.push({
            button: item.button,
            type: group.type,
            name: group.name,
            groupSize: group.books.length
          });

          consumed += occupiedWidth;
          tallest = Math.max(tallest, item.height);

          line.style.height = `${tallest + 22}px`;
        }
      }

      // Measure plaques only after placing every book.
      for (const row of completeRows) {
        this.addGroupPlaques(row.plank, row.books);
      }
    }

    this.lastWidth = caseNode.clientWidth;
  },

  showDetails(book, category) {
    const content = document.getElementById(
      'bookshelf-details-content'
    );

    if (!this.dialog || !content) return;

    const categoryName =
      this.categories.find(
        item => item.key === category
      )?.title || 'Book';

    content.replaceChildren();

    const dialogTitle = this.element(
      'h2',
      'bookshelf-dialog__title',
      String(book.title || 'Untitled')
    );

    dialogTitle.id = 'bookshelf-details-title';

    content.append(
      this.element('p', 'eyebrow', categoryName),
      dialogTitle
    );

    const metadata = [
      book.author,
      book.format && book.format !== 'Book'
        ? book.format
        : '',
      book.series,
      Number.isFinite(book.seriesOrder)
        ? (
          book.seriesOrder === 0
            ? 'Prequel'
            : `Book ${book.seriesOrder}`
        )
        : '',
      this.statusLabel(book.status)
    ].filter(Boolean);

    if (metadata.length) {
      content.append(
        this.element(
          'p',
          'bookshelf-dialog__meta',
          metadata.join(' · ')
        )
      );
    }

    const description = this.element(
      'section',
      'bookshelf-dialog__section'
    );

    description.append(
      this.element('h3', '', 'About this book')
    );

    description.append(
      this.element(
        'p',
        '',
        book.summary?.trim() ||
          'A description has not been added yet.'
      )
    );

    content.append(description);

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
      book.reflection?.trim() ||
        'Personal reflection coming soon.'
    );

    if (!book.reflection?.trim()) {
      reflectionText.classList.add(
        'bookshelf-dialog__reflection--empty'
      );
    }

    reflection.append(reflectionText);
    content.append(reflection);

    // Focus the heading rather than the Close button.
    // Otherwise the browser may scroll to the dialog footer.
    dialogTitle.tabIndex = -1;

    if (!this.dialog.open) {
      this.dialog.showModal();
    }

    dialogTitle.focus({ preventScroll: true });
    this.dialog.scrollTop = 0;

    requestAnimationFrame(() => {
      this.dialog.scrollTop = 0;
    });
  },

  async init() {
    this.container = document.getElementById('bookshelf');
    this.dialog = document.getElementById(
      'bookshelf-details'
    );

    if (!this.container || !this.dialog) return;

    // Close the book dialog when the user clicks outside it.
    // Clicking inside the dialog does not close it.
    this.dialog.addEventListener('click', (event) => {
      if (event.target !== this.dialog) return;

      const bounds = this.dialog.getBoundingClientRect();

      const clickedOutside =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;

      if (clickedOutside) {
        this.dialog.close();
      }
    });

    const toggle = document.querySelector('.nav-toggle');
    const navigation = document.querySelector('.site-nav');

    if (toggle && navigation) {
      toggle.addEventListener('click', () => {
        const expanded =
          toggle.getAttribute('aria-expanded') === 'true';

        toggle.setAttribute(
          'aria-expanded',
          String(!expanded)
        );

        navigation.classList.toggle(
          'is-open',
          !expanded
        );
      });
    }

    document.querySelectorAll(
      '[data-current-year]'
    ).forEach(node => {
      node.textContent = new Date().getFullYear();
    });

    try {
      const response = await fetch(
        'assets/learning-books.json'
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data.books)) {
        throw new Error('Expected a books array.');
      }

      this.books = data.books;

      const canvas = document.createElement('canvas');
      this.measureContext = canvas.getContext('2d');

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      this.render();

      const handleResize = () => {
        const width = this.container.querySelector(
          '.bookshelf-case'
        )?.clientWidth;

        if (width && width !== this.lastWidth) {
          this.render();
        }
      };

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(
          handleResize
        );

        this.resizeObserver.observe(this.container);
      } else {
        window.addEventListener('resize', handleResize);
      }

    } catch (error) {
      console.error(
        'Unable to load the learning journal:',
        error
      );

      this.container.replaceChildren(
        this.element(
          'p',
          'learning-error',
          'The bookshelf could not load. Check assets/learning-books.json and use a local web server.'
        )
      );
    }
  }
};

Bookshelf.init();