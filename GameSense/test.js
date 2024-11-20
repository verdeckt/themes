class GSEnhancedUI {
    constructor() {
        this.cache = {};
        this.currentTheme = GM_getValue('theme', 'default');
        this.chatHistory = GM_getValue('chatHistory', []);
        this.bookmarks = GM_getValue('bookmarks', {});
        this.mentionCache = new Set();
        this.init();
    }

    init() {
        this.addThemeToggle();
        this.setupProfileHover();
        this.addCollapsibleCategories();
        this.removeSubscribeLink();
        this.addRollButton();
        this.setupUndercoverMode();
        this.initThreadFeatures();
        this.initChatFeatures();
        document.body.setAttribute('data-theme', this.currentTheme);
    }

    removeSubscribeLink() {
        const subscribeLink = document.querySelector('.subscribelink');
        if (subscribeLink) {
            subscribeLink.remove();
        }
    }

    addThemeToggle() {
        const logoutLink = document.querySelector('#navlogout');
        if (!logoutLink) return;

        const themeToggle = document.createElement('li');
        themeToggle.id = 'theme-toggle';
        themeToggle.innerHTML = this.getThemeIcon(this.currentTheme);

        themeToggle.addEventListener('click', () => {
            this.cycleTheme();
            themeToggle.innerHTML = this.getThemeIcon(this.currentTheme);
        });

        logoutLink.parentNode.insertBefore(themeToggle, logoutLink.nextSibling);
    }

    getThemeIcon(theme) {
        const icons = {
            'default': 'fa-adjust',
            'light-red': 'fa-fire',
            'light-orange': 'fa-sun-o'
        };
        return `<i class="fa ${icons[theme]} theme-icon"></i>`;
    }

    cycleTheme() {
        const themes = ['default', 'light-red', 'light-orange'];
        const currentIndex = themes.indexOf(this.currentTheme);
        this.currentTheme = themes[(currentIndex + 1) % themes.length];
        GM_setValue('theme', this.currentTheme);
        document.body.setAttribute('data-theme', this.currentTheme);
    }

    addRollButton() {
        const emojiSelector = document.querySelector('#emojiselector');
        if (emojiSelector) {
            const rollButton = document.createElement('div');
            rollButton.className = 'chat-roll';
            rollButton.innerHTML = '🎲';
            rollButton.style.cssText = `
                cursor: pointer;
                margin-right: 5px;
                font-size: 16px;
                display: inline-block;
                vertical-align: middle;
                padding: 0 5px;
            `;
            
            rollButton.addEventListener('click', () => {
                const chatInput = document.querySelector('#shouttext');
                if (chatInput) {
                    chatInput.value = '/roll';
                    const event = new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        keyCode: 13,
                        which: 13,
                        bubbles: true
                    });
                    chatInput.dispatchEvent(event);
                }
            });
            
            emojiSelector.parentNode.insertBefore(rollButton, emojiSelector);
        }
    }

    setupUndercoverMode() {
        const loggedInSpan = document.querySelector('#brdwelcome .conl li:first-child span');
        if (loggedInSpan) {
            const eyeButton = document.createElement('i');
            eyeButton.className = 'fa fa-eye';
            eyeButton.style.cssText = `
                cursor: pointer;
                margin-left: 5px;
                opacity: 0.7;
            `;
            
            const isUndercover = GM_getValue('undercover', false);
            if (isUndercover) {
                this.enableUndercoverMode();
                eyeButton.className = 'fa fa-eye-slash';
            }

            eyeButton.addEventListener('click', () => {
                const currentState = GM_getValue('undercover', false);
                GM_setValue('undercover', !currentState);
                
                if (!currentState) {
                    this.enableUndercoverMode();
                    eyeButton.className = 'fa fa-eye-slash';
                } else {
                    this.disableUndercoverMode();
                    eyeButton.className = 'fa fa-eye';
                }
            });

            loggedInSpan.appendChild(eyeButton);
        }
    }

    enableUndercoverMode() {
        const username = GM_getValue('username');
        if (!username) return;

        document.querySelectorAll('a[href*="profile.php"], #brdwelcome .conl li:first-child strong').forEach(element => {
            if (element.textContent.trim() === username) {
                element.setAttribute('data-original', element.textContent);
                element.textContent = '<HIDDEN>';
            }
        });
    }

    disableUndercoverMode() {
        document.querySelectorAll('[data-original]').forEach(element => {
            if (element.getAttribute('data-original')) {
                element.textContent = element.getAttribute('data-original');
                element.removeAttribute('data-original');
            }
        });
    }

    addCollapsibleCategories() {
        const categories = document.querySelectorAll('.blocktable h2');
        
        categories.forEach(category => {
            const magnetIcon = document.createElement('i');
            magnetIcon.className = 'fa fa-magnet';
            
            const headerWrapper = document.createElement('div');
            headerWrapper.style.cssText = `
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
            `;
            
            const span = category.querySelector('span');
            const content = span ? span.cloneNode(true) : document.createElement('span');
            
            headerWrapper.appendChild(magnetIcon);
            headerWrapper.appendChild(content);
            category.textContent = '';
            category.appendChild(headerWrapper);
            
            const categoryContent = category.closest('.blocktable');
            const contentSection = categoryContent.querySelector('.inbox, tbody');
            
            headerWrapper.addEventListener('click', () => {
                const isCollapsed = contentSection.style.display === 'none';
                contentSection.style.display = isCollapsed ? '' : 'none';
                magnetIcon.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)';
                GM_setValue(`category_${category.textContent.trim()}_collapsed`, !isCollapsed);
            });
            
            const savedState = GM_getValue(`category_${category.textContent.trim()}_collapsed`, false);
            if (savedState) {
                contentSection.style.display = 'none';
                magnetIcon.style.transform = 'rotate(180deg)';
            }
        });
    }

    setupProfileHover() {
        document.addEventListener('mouseover', async (e) => {
            const userLink = e.target.closest('a[href*="profile.php"]');
            if (userLink && !userLink.querySelector('.gs-profile-preview')) {
                const userId = this.getUserIdFromUrl(userLink.href);
                if (userId) {
                    const preview = await this.createProfilePreview(userId);
                    preview.style.position = 'absolute';
                    preview.style.zIndex = '1000';
                    document.body.appendChild(preview);

                    const rect = userLink.getBoundingClientRect();
                    preview.style.left = `${rect.right + 10}px`;
                    preview.style.top = `${rect.top}px`;

                    userLink.addEventListener('mouseleave', () => {
                        preview.remove();
                    });
                }
            }
        });
    }

    async createProfilePreview(userId) {
        if (this.cache[userId]) {
            return this.createPreviewElement(this.cache[userId]);
        }

        const preview = document.createElement('div');
        preview.className = 'gs-profile-preview';
        preview.innerHTML = '<div class="loading">Loading...</div>';

        try {
            const data = await this.fetchProfileData(userId);
            this.cache[userId] = data;
            return this.createPreviewElement(data);
        } catch (error) {
            preview.innerHTML = '<div class="error">Failed to load profile</div>';
            return preview;
        }
    }

    createPreviewElement(data) {
        const preview = document.createElement('div');
        preview.className = 'gs-profile-preview';
        preview.innerHTML = `
            <div class="preview-header">
                <div class="preview-username ${data.userClass}">${data.username}</div>
                <div class="preview-status ${data.online ? 'online' : 'offline'}">
                    ${data.online ? 'Online' : 'Offline'}
                </div>
            </div>
            <div class="preview-stats">
                <div class="stat">
                    <span class="label">Posts:</span>
                    <span class="value">${data.posts}</span>
                </div>
                <div class="stat">
                    <span class="label">Joined:</span>
                    <span class="value">${data.joined}</span>
                </div>
                <div class="stat">
                    <span class="label">Reputation:</span>
                    <span class="value">${data.reputation}</span>
                </div>
            </div>
            <div class="preview-actions">
                <a href="pmsnew.php?mdl=post&uid=${data.userId}" class="preview-action">
                    <i class="fa fa-envelope"></i> PM
                </a>
                <a href="search.php?action=show_user_topics&user_id=${data.userId}" class="preview-action">
                    <i class="fa fa-list"></i> Topics
                </a>
                <a href="search.php?action=show_user_posts&user_id=${data.userId}" class="preview-action">
                    <i class="fa fa-comments"></i> Posts
                </a>
            </div>
        `;
        return preview;
    }

    async fetchProfileData(userId) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://gamesense.pub/forums/profile.php?id=${userId}`,
                onload: (response) => {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');
                        
                        const data = {
                            userId: userId,
                            username: this.extractUsername(doc),
                            userClass: this.extractUserClass(doc),
                            online: this.isUserOnline(doc),
                            posts: this.extractPosts(doc),
                            joined: this.extractJoinDate(doc),
                            reputation: this.extractReputation(doc)
                        };
                        
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                },
                onerror: reject
            });
        });
    }

    extractUsername(doc) {
        return doc.querySelector('.blockform h2')?.textContent.split('-')[0].trim() || 'Unknown';
    }

    extractUserClass(doc) {
        if (doc.querySelector('.usergroup-5')) return 'premium';
        if (doc.querySelector('.usergroup-4')) return 'moderator';
        if (doc.querySelector('.usergroup-1')) return 'admin';
        return 'member';
    }

    isUserOnline(doc) {
        return !!doc.querySelector('.online-status');
    }

    extractPosts(doc) {
        const postsElement = doc.querySelector('td:contains("Number of posts")');
        return postsElement ? postsElement.nextElementSibling.textContent.trim() : '0';
    }

    extractJoinDate(doc) {
        const joinElement = doc.querySelector('td:contains("Registered")');
        return joinElement ? joinElement.nextElementSibling.textContent.trim() : 'Unknown';
    }

    extractReputation(doc) {
        const repElement = doc.querySelector('td:contains("Reputation")');
        return repElement ? repElement.nextElementSibling.textContent.trim() : '0';
    }

        // Thread Features
        initThreadFeatures() {
            if (this.isThreadPage()) {
                this.addThreadBookmark();
                this.enhanceCodeBlocks();
                this.addQuickReplyEnhancements();
                this.setupImagePreview();
                this.addAutoRefresh();
                this.addThreadNavigation();
            }
        }
    
        addThreadBookmark() {
            const threadTitle = document.querySelector('.linkst .inbox h2');
            if (!threadTitle) return;
    
            const threadId = this.getThreadIdFromUrl(window.location.href);
            const bookmarkBtn = document.createElement('i');
            bookmarkBtn.className = `fa fa-bookmark${this.bookmarks[threadId] ? '' : '-o'}`;
            bookmarkBtn.style.cssText = `
                margin-left: 10px;
                cursor: pointer;
                color: ${this.bookmarks[threadId] ? '#e61515' : '#666'};
            `;
    
            bookmarkBtn.addEventListener('click', () => {
                if (this.bookmarks[threadId]) {
                    delete this.bookmarks[threadId];
                    bookmarkBtn.className = 'fa fa-bookmark-o';
                    bookmarkBtn.style.color = '#666';
                } else {
                    this.bookmarks[threadId] = {
                        title: threadTitle.textContent,
                        url: window.location.href,
                        date: new Date().toISOString(),
                        lastPost: document.querySelector('.post').textContent
                    };
                    bookmarkBtn.className = 'fa fa-bookmark';
                    bookmarkBtn.style.color = '#e61515';
                }
                GM_setValue('bookmarks', this.bookmarks);
            });
    
            threadTitle.appendChild(bookmarkBtn);
        }
    
        enhanceCodeBlocks() {
            document.querySelectorAll('pre, code').forEach(block => {
                // Add copy button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'gs-copy-btn';
                copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(block.textContent);
                    copyBtn.innerHTML = '<i class="fa fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
                    }, 2000);
                });
    
                // Add syntax highlighting
                block.classList.add('gs-code-block');
                if (!block.classList.contains('language-none')) {
                    block.classList.add('language-lua');
                    Prism.highlightElement(block);
                }
    
                // Wrap in container
                const container = document.createElement('div');
                container.className = 'gs-code-container';
                block.parentNode.insertBefore(container, block);
                container.appendChild(block);
                container.appendChild(copyBtn);
            });
        }
    
        addQuickReplyEnhancements() {
            const quickReply = document.querySelector('#quickpost');
            if (!quickReply) return;
    
            // Add formatting toolbar
            const toolbar = document.createElement('div');
            toolbar.className = 'gs-formatting-toolbar';
            toolbar.innerHTML = `
                <button data-tag="b" title="Bold"><i class="fa fa-bold"></i></button>
                <button data-tag="i" title="Italic"><i class="fa fa-italic"></i></button>
                <button data-tag="u" title="Underline"><i class="fa fa-underline"></i></button>
                <button data-tag="s" title="Strike"><i class="fa fa-strikethrough"></i></button>
                <button data-tag="code" title="Code"><i class="fa fa-code"></i></button>
                <button data-tag="url" title="Link"><i class="fa fa-link"></i></button>
                <button data-tag="img" title="Image"><i class="fa fa-image"></i></button>
                <button data-tag="quote" title="Quote"><i class="fa fa-quote-right"></i></button>
                <button data-tag="spoiler" title="Spoiler"><i class="fa fa-eye-slash"></i></button>
            `;
    
            toolbar.addEventListener('click', e => {
                const button = e.target.closest('button');
                if (!button) return;
    
                const textarea = quickReply.querySelector('textarea');
                const tag = button.dataset.tag;
                this.insertBBCode(textarea, tag);
            });
    
            quickReply.insertBefore(toolbar, quickReply.firstChild);
    
            this.addEmojiPicker(quickReply);
    
            const textarea = quickReply.querySelector('textarea');
            textarea.addEventListener('input', () => {
                GM_setValue('quickreply_draft', textarea.value);
            });
    
            const savedDraft = GM_getValue('quickreply_draft', '');
            if (savedDraft) {
                textarea.value = savedDraft;
            }
        }
    
        insertBBCode(textarea, tag) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selected = textarea.value.substring(start, end);
            
            let insertion = '';
            switch(tag) {
                case 'url':
                    const url = prompt('Enter URL:', 'http://');
                    if (url) insertion = `[url=${url}]${selected || 'link text'}[/url]`;
                    break;
                case 'img':
                    const imgUrl = prompt('Enter image URL:', 'http://');
                    if (imgUrl) insertion = `[img]${imgUrl}[/img]`;
                    break;
                case 'spoiler':
                    insertion = `[spoiler]${selected}[/spoiler]`;
                    break;
                default:
                    insertion = `[${tag}]${selected}[/${tag}]`;
            }
    
            if (insertion) {
                textarea.value = textarea.value.substring(0, start) + insertion + textarea.value.substring(end);
                textarea.focus();
                textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
            }
        }
    
        setupImagePreview() {
            document.addEventListener('mouseover', e => {
                const link = e.target.closest('a');
                if (link && this.isImageLink(link.href)) {
                    this.showImagePreview(link, e);
                }
            });
        }
    
        isImageLink(url) {
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
        }
    
        showImagePreview(link, event) {
            let preview = document.querySelector('.gs-image-preview');
            if (!preview) {
                preview = document.createElement('div');
                preview.className = 'gs-image-preview';
                document.body.appendChild(preview);
            }
    
            const img = new Image();
            img.src = link.href;
            preview.innerHTML = '';
            preview.appendChild(img);
    
            const rect = link.getBoundingClientRect();
            preview.style.left = `${rect.right + 10}px`;
            preview.style.top = `${rect.top}px`;
    
            link.addEventListener('mouseleave', () => {
                preview.remove();
            });
        }

    initChatFeatures() {
        const chatbox = document.querySelector('#shoutbox');
        if (!chatbox) return;

        this.setupEnhancedChat();
        this.addEmojiPicker(chatbox);
        this.setupMentionSystem();
        this.setupChatHistory();
        this.addChatFilters();
        this.setupCustomChatColors();
        this.addChatCommands();
    }

    setupEnhancedChat() {
        const chatContainer = document.querySelector('#shoutbox');
        if (!chatContainer) return;

        const enhancementsContainer = document.createElement('div');
        enhancementsContainer.className = 'gs-chat-enhancements';
        chatContainer.insertBefore(enhancementsContainer, chatContainer.firstChild);

        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'gs-chat-settings-btn';
        settingsBtn.innerHTML = '<i class="fa fa-cog"></i>';
        settingsBtn.addEventListener('click', () => this.showChatSettings());
        enhancementsContainer.appendChild(settingsBtn);

        const clearBtn = document.createElement('button');
        clearBtn.className = 'gs-chat-clear-btn';
        clearBtn.innerHTML = '<i class="fa fa-trash"></i>';
        clearBtn.addEventListener('click', () => this.clearChat());
        enhancementsContainer.appendChild(clearBtn);

        this.setupChatAutoScroll();
    }

    setupChatAutoScroll() {
        const chatbox = document.querySelector('#shoutbox');
        let autoScroll = true;

        const scrollToggle = document.createElement('button');
        scrollToggle.className = 'gs-chat-scroll-toggle active';
        scrollToggle.innerHTML = '<i class="fa fa-arrow-down"></i>';
        scrollToggle.addEventListener('click', () => {
            autoScroll = !autoScroll;
            scrollToggle.classList.toggle('active');
        });
        chatbox.appendChild(scrollToggle);

        const observer = new MutationObserver(() => {
            if (autoScroll) {
                chatbox.scrollTop = chatbox.scrollHeight;
            }
        });

        observer.observe(chatbox, { childList: true, subtree: true });
    }

    addEmojiPicker(container) {
        const emojiButton = document.createElement('button');
        emojiButton.className = 'gs-emoji-button';
        emojiButton.innerHTML = '😀';

        const emojiPicker = document.createElement('div');
        emojiPicker.className = 'gs-emoji-picker';
        emojiPicker.style.display = 'none';

        const emojis = {
            'Smileys': ['😀', '😂', '😅', '😊', '😎', '🤔', '😴', '😍'],
            'Gestures': ['👍', '👎', '👌', '✌️', '🤝', '👊', '✋', '🤚'],
            'Objects': ['💻', '📱', '⌨️', '🖥️', '🎮', '🎲', '💡', '⚡'],
            'Symbols': ['❤️', '💯', '✨', '💫', '💥', '🔥', '⭐', '💪']
        };

        Object.entries(emojis).forEach(([category, categoryEmojis]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'gs-emoji-category';
            categoryDiv.innerHTML = `<div class="category-title">${category}</div>`;

            categoryEmojis.forEach(emoji => {
                const emojiSpan = document.createElement('span');
                emojiSpan.textContent = emoji;
                emojiSpan.addEventListener('click', () => {
                    const textarea = container.querySelector('textarea');
                    if (textarea) {
                        const start = textarea.selectionStart;
                        textarea.value = textarea.value.slice(0, start) + emoji + textarea.value.slice(textarea.selectionEnd);
                        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
                        textarea.focus();
                    }
                    emojiPicker.style.display = 'none';
                });
                categoryDiv.appendChild(emojiSpan);
            });

            emojiPicker.appendChild(categoryDiv);
        });

        emojiButton.addEventListener('click', (e) => {
            e.preventDefault();
            emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', (e) => {
            if (!emojiPicker.contains(e.target) && e.target !== emojiButton) {
                emojiPicker.style.display = 'none';
            }
        });

        container.appendChild(emojiButton);
        container.appendChild(emojiPicker);
    }

    setupMentionSystem() {
        const chatInput = document.querySelector('#shouttext');
        if (!chatInput) return;

        chatInput.addEventListener('input', () => {
            const cursorPos = chatInput.selectionStart;
            const text = chatInput.value;
            const beforeCursor = text.substring(0, cursorPos);
            const mentionMatch = beforeCursor.match(/@(\w*)$/);

            if (mentionMatch) {
                this.showMentionSuggestions(mentionMatch[1]);
            } else {
                this.hideMentionSuggestions();
            }
        });

        setInterval(() => {
            const onlineUsers = Array.from(document.querySelectorAll('#onlinelist a'))
                .map(a => a.textContent.trim());
            this.mentionCache = new Set(onlineUsers);
        }, 30000);
    }

    showMentionSuggestions(query) {
        let suggestions = document.querySelector('.gs-mention-suggestions');
        if (!suggestions) {
            suggestions = document.createElement('div');
            suggestions.className = 'gs-mention-suggestions';
            document.querySelector('#shoutbox').appendChild(suggestions);
        }

        const matches = Array.from(this.mentionCache)
            .filter(user => user.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5);

        suggestions.innerHTML = matches
            .map(user => `<div class="mention-suggestion">${user}</div>`)
            .join('');

        suggestions.querySelectorAll('.mention-suggestion').forEach(div => {
            div.addEventListener('click', () => {
                const chatInput = document.querySelector('#shouttext');
                const text = chatInput.value;
                const beforeMention = text.substring(0, chatInput.selectionStart).replace(/@\w*$/, '');
                const afterMention = text.substring(chatInput.selectionStart);
                chatInput.value = beforeMention + '@' + div.textContent + ' ' + afterMention;
                this.hideMentionSuggestions();
                chatInput.focus();
            });
        });
    }

    hideMentionSuggestions() {
        const suggestions = document.querySelector('.gs-mention-suggestions');
        if (suggestions) {
            suggestions.remove();
        }
    }

    setupChatHistory() {
        const chatInput = document.querySelector('#shouttext');
        if (!chatInput) return;

        let historyIndex = -1;

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim()) {
                this.chatHistory.unshift(chatInput.value);
                if (this.chatHistory.length > 50) this.chatHistory.pop();
                GM_setValue('chatHistory', this.chatHistory);
                historyIndex = -1;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                historyIndex = Math.min(historyIndex + 1, this.chatHistory.length - 1);
                if (historyIndex >= 0) {
                    chatInput.value = this.chatHistory[historyIndex];
                }
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                historyIndex = Math.max(historyIndex - 1, -1);
                chatInput.value = historyIndex >= 0 ? this.chatHistory[historyIndex] : '';
            }
        });
    }

    addChatFilters() {
        const filters = document.createElement('div');
        filters.className = 'gs-chat-filters';
        filters.innerHTML = `
            <label><input type="checkbox" data-filter="commands"> Hide Commands</label>
            <label><input type="checkbox" data-filter="joins"> Hide Joins/Leaves</label>
            <label><input type="checkbox" data-filter="links"> Hide Links</label>
        `;

        filters.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (checkbox.type === 'checkbox') {
                document.querySelector('#shoutbox').classList.toggle(
                    `hide-${checkbox.dataset.filter}`,
                    checkbox.checked
                );
                GM_setValue(`chat-filter-${checkbox.dataset.filter}`, checkbox.checked);
            }
        });

        filters.querySelectorAll('input').forEach(checkbox => {
            const saved = GM_getValue(`chat-filter-${checkbox.dataset.filter}`);
            if (saved) {
                checkbox.checked = true;
                document.querySelector('#shoutbox').classList.add(`hide-${checkbox.dataset.filter}`);
            }
        });

        document.querySelector('#shoutbox').insertBefore(filters, document.querySelector('#shoutbox').firstChild);
    }

    setupCustomChatColors() {
        const style = document.createElement('style');
        style.textContent = `
            .premium-chat { color: #e61515 !important; }
            .moderator-chat { color: #ffcc00 !important; }
            .admin-chat { color: #b4e61e !important; }
        `;
        document.head.appendChild(style);

        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('shout')) {
                        const userLink = node.querySelector('a');
                        if (userLink) {
                            if (userLink.classList.contains('usergroup-5')) {
                                node.classList.add('premium-chat');
                            } else if (userLink.classList.contains('usergroup-4')) {
                                node.classList.add('moderator-chat');
                            } else if (userLink.classList.contains('usergroup-1')) {
                                node.classList.add('admin-chat');
                            }
                        }
                    }
                });
            });
        });

        const chatContainer = document.querySelector('#shoutbox');
        if (chatContainer) {
            observer.observe(chatContainer, { childList: true, subtree: true });
        }
    }

    addChatCommands() {
        const commands = {
            '/me': (text) => `*${text}*`,
            '/roll': () => `🎲 Rolled ${Math.floor(Math.random() * 100) + 1}`,
            '/flip': () => `🎲 Coin flip: ${Math.random() < 0.5 ? 'Heads' : 'Tails'}`,
            '/shrug': () => '¯\\_(ツ)_/¯',
            '/tableflip': () => '(╯°□°）╯︵ ┻━┻',
            '/unflip': () => '┬─┬ ノ( ゜-゜ノ)',
            '/lenny': () => '( ͡° ͜ʖ ͡°)',
            '/time': () => `Current time: ${new Date().toLocaleTimeString()}`
        };

        const chatInput = document.querySelector('#shouttext');
        if (!chatInput) return;

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const text = chatInput.value.trim();
                const [command, ...args] = text.split(' ');
                
                if (commands[command]) {
                    e.preventDefault();
                    chatInput.value = commands[command](args.join(' '));
                }
            }
        });

        const helpBtn = document.createElement('button');
        helpBtn.className = 'gs-chat-help';
        helpBtn.innerHTML = '<i class="fa fa-question-circle"></i>';
        helpBtn.title = 'Show chat commands';
        
        helpBtn.addEventListener('click', () => {
            const helpDialog = document.createElement('div');
            helpDialog.className = 'gs-chat-help-dialog';
            helpDialog.innerHTML = `
                <h3>Chat Commands</h3>
                <ul>
                    ${Object.keys(commands).map(cmd => 
                        `<li><code>${cmd}</code></li>`
                    ).join('')}
                </ul>
                <button class="close">Close</button>
            `;

            helpDialog.querySelector('.close').addEventListener('click', () => 
                helpDialog.remove()
            );

            document.body.appendChild(helpDialog);
        });

        chatInput.parentNode.appendChild(helpBtn);
    }

    isThreadPage() {
        return window.location.href.includes('viewtopic.php');
    }

    getThreadIdFromUrl(url) {
        const match = url.match(/id=(\d+)/);
        return match ? match[1] : null;
    }

    getUserIdFromUrl(url) {
        const match = url.match(/id=(\d+)/);
        return match ? match[1] : null;
    }
}

window.addEventListener('load', () => new GSEnhancedUI());