class IconBar extends HTMLElement {
  connectedCallback() {
    const icons = this.getIcons();

    this.innerHTML = `
      <section class="tech-strip" aria-label="${this.getAttribute("aria-label") || "Tools and technologies"}">
        ${icons.map(icon => `
          <span class="tech-item" title="${icon.title}">
            <img src="${icon.src}" alt="${icon.alt}" loading="lazy" />
          </span>
        `).join("")}
      </section>
    `;
  }

  getIcons() {
    return [];
  }
}

class IconBar1 extends IconBar {
  getIcons() {
    return [
      {
        title: "Java",
        alt: "Java",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original-wordmark.svg"
      },
      {
        title: "JavaScript",
        alt: "JavaScript",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg"
      },
      {
        title: "HTML5",
        alt: "HTML5",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg"
      },
      {
        title: "CSS3",
        alt: "CSS3",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg"
      },
      {
        title: "JSON",
        alt: "JSON",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/json/json-original.svg"
      },
      {
        title: "C",
        alt: "C",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg"
      },
      {
        title: "C#",
        alt: "C#",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg"
      },
      {
        title: "C++",
        alt: "C++",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg"
      },
      {
        title: "Kotlin",
        alt: "Kotlin",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kotlin/kotlin-original.svg"
      },
      {
        title: "Python",
        alt: "Python",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg"
      },
      {
        title: "PostgreSQL",
        alt: "PostgreSQL",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg"
      },
      {
        title: "SQLite",
        alt: "SQLite",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg"
      },
      {
        title: "MySQL",
        alt: "MySQL",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg"
      }
    ];
  }
}

class IconBar2 extends IconBar {
  getIcons() {
    return [
      {
        title: "React",
        alt: "React",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
      },
      {
        title: "Expo",
        alt: "Expo",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/expo/expo-original.svg"
      },
      {
        title: "Firebase",
        alt: "Firebase",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg"
      },
      {
        title: "Flask",
        alt: "Flask",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg"
      },
      {
        title: "FastAPI",
        alt: "FastAPI",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg"
      },
      {
        title: "Docker",
        alt: "Docker",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg"
      },
      {
        title: "AWS",
        alt: "Amazon Web Services",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg"
      },
      {
        title: "Google Cloud",
        alt: "Google Cloud",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg"
      },
      {
        title: "GitHub",
        alt: "GitHub",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg"
      },
      {
        title: "VS Code",
        alt: "Visual Studio Code",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg"
      },
      {
        title: "Unity",
        alt: "Unity",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unity/unity-original.svg"
      },
      {
        title: "Unreal Engine",
        alt: "Unreal Engine",
        src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/unrealengine/unrealengine-original.svg"
      }
    ];
  }
}

customElements.define("icon-bar-1", IconBar1);
customElements.define("icon-bar-2", IconBar2);