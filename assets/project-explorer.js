/* Project Explorer: independent of the Learning Journal. */
const ProjectExplorer = {
  projects: [],
  index: null,
  detail: null,
  selectedId: null,

  element(tag, className = '', value = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  },

  // Restrict project links and media sources to known safe URL forms.
  isSafeUrl(url, allowRelative = false) {
    if (typeof url !== 'string') return false;
    if (url.startsWith('https://')) return true;
    return allowRelative && url.startsWith('assets/') && !url.includes('..') && /^[a-zA-Z0-9_./-]+$/.test(url);
  },

  projectFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    return this.projects.find(project => project.id === id) || this.projects[0];
  },

  renderIndex() {
    this.index.replaceChildren();
    this.projects.forEach((project, i) => {
      const button = this.element('button', 'project-explorer__item');
      button.type = 'button';
      button.dataset.projectId = project.id;
      button.setAttribute('aria-controls', 'project-explorer-detail');
      button.append(
        this.element('span', 'project-explorer__item-category',
          `${String(i + 1).padStart(2, '0')} / ${project.category}`),
        this.element('span', 'project-explorer__item-title', project.title)
      );
      button.addEventListener('click', () => this.select(project.id, true));
      this.index.append(button);
    });
  },

  renderMedia(media) {
    if (!Array.isArray(media) || !media.length) return null;
    const gallery = this.element('div', 'project-explorer__gallery');
    for (const item of media) {
      if (!item || !this.isSafeUrl(item.src, true)) continue;
      const figure = this.element('figure', 'project-explorer__figure');
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      figure.append(img);
      if (item.caption) figure.append(this.element('figcaption', '', item.caption));
      gallery.append(figure);
    }
    return gallery.children.length ? gallery : null;
  },

  renderDetail(project) {
    const article = this.element('article', 'project-explorer__article');
    const title = this.element('h3', 'project-explorer__title', project.title);
    title.id = 'project-explorer-title';
    article.append(
      this.element('p', 'project-explorer__category', project.category),
      title,
      this.element('p', 'project-explorer__summary', project.summary || '')
    );

    const gallery = this.renderMedia(project.media);
    if (gallery) article.append(gallery);

    if (Array.isArray(project.technologies) && project.technologies.length) {
      const tags = this.element('ul', 'tag-list project-explorer__tags');
      tags.setAttribute('aria-label', 'Technologies');
      for (const technology of project.technologies) {
        const li = document.createElement('li');
        li.append(this.element('span', 'tag', technology));
        tags.append(li);
      }
      article.append(tags);
    }

    for (const section of project.sections || []) {
      const block = this.element('section', 'project-explorer__section');
      block.append(this.element('h4', '', section.heading || 'Details'));
      for (const paragraph of section.paragraphs || []) {
        block.append(this.element('p', '', paragraph));
      }
      if (Array.isArray(section.points) && section.points.length) {
        const list = document.createElement('ul');
        for (const point of section.points) {
          list.append(this.element('li', '', point));
        }
        block.append(list);
      }
      article.append(block);
    }

    if (Array.isArray(project.links) && project.links.length) {
      const links = this.element('div', 'project-explorer__links');
      for (const item of project.links) {
        if (!item || !this.isSafeUrl(item.url)) continue;
        const link = this.element('a', 'text-link', item.label || 'View project');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        links.append(link);
      }
      if (links.children.length) article.append(links);
    }

    this.detail.replaceChildren(article);
    this.detail.setAttribute('aria-labelledby', title.id);
    this.detail.scrollTop = 0;
  },

  select(id, updateHistory = false) {
    const project = this.projects.find(item => item.id === id);
    if (!project) return;
    if (updateHistory && location.hash !== `#${encodeURIComponent(id)}`) {
      history.pushState(null, '', `#${encodeURIComponent(id)}`);
    }
    if (this.selectedId === id) return;

    this.selectedId = id;
    this.renderDetail(project);
    this.index.querySelectorAll('.project-explorer__item').forEach(button => {
      const active = button.dataset.projectId === id;
      button.classList.toggle('is-selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  },

  async init() {
    const root = document.getElementById('project-explorer');
    this.index = document.getElementById('project-explorer-index');
    this.detail = document.getElementById('project-explorer-detail');
    if (!root || !this.index || !this.detail) return;

    try {
      const response = await fetch('assets/projects-data.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.projects) || !data.projects.length) {
        throw new Error('Expected a nonempty projects array.');
      }
      this.projects = data.projects;
    //   document.getElementById('project-explorer-count').textContent =
    //     `${this.projects.length} ${this.projects.length === 1 ? 'PROJECT' : 'PROJECTS'}`;
      this.renderIndex();
      this.select(this.projectFromHash().id);

      // Center the Project Explorer when arriving through a direct
      // project link, such as projects.html#arith-matic.
      // Ordinary visits to projects.html remain at the top of the page.
      const hasProjectLink = this.projects.some(
        project => `#${encodeURIComponent(project.id)}` === location.hash
      );

      if (hasProjectLink) {
        requestAnimationFrame(() => {
          root.scrollIntoView({
            behavior: 'auto',
            block: 'center'
          });
        });
      }

      const syncFromUrl = () => this.select(this.projectFromHash().id);
      window.addEventListener('popstate', syncFromUrl);
      window.addEventListener('hashchange', syncFromUrl);
    } catch (error) {
      console.error('Unable to load projects:', error);
      this.index.replaceChildren();
      this.detail.replaceChildren(this.element('p', 'learning-error',
        'Projects could not load. Check assets/projects-data.json and use a local web server.'));
    }
  }
};

ProjectExplorer.init();