class GSEnhancedUI {
    constructor() {
        this.cache = {};
        this.currentTheme = GM_getValue('theme', 'default');
        this.init();
    }

    init() {
        this.addThemeToggle();
        this.setupProfileHover();
        this.addCollapsibleCategories();
        this.removeSubscribeLink();
        this.addRollButton();
        this.setupUndercoverMode();
        this.setupResellerList();
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

    setupResellerList() {
        const managePayments = document.querySelector('.blockform');
        if (!managePayments || !window.location.href.includes('payment.php')) return;
    
        const resellerSection = document.createElement('div');
        resellerSection.className = 'blockform';
        resellerSection.innerHTML = `
            <h2><span>Verified Resellers</span></h2>
            <div class="box">
                <div class="fakeform">
                    <div class="inform">
                        <fieldset>
                            <legend>Alternative Payment Methods</legend>
                            <div class="fakeform">
                                <p>Below is a list of verified resellers. Please be careful and only deal with listed resellers to avoid scams.</p>
                                <table>
                                    <tr>
                                        <th class="tcl">Reseller</th>
                                        <th class="tcl">Payment Methods</th>
                                        <th class="tcl">Price</th>
                                        <th class="tcl">Action</th>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1">Sigma</a></td>
                                        <td>Crypto, PayPal, CashApp</td>
                                        <td>24 USD</td>
                                        <td><a href="viewtopic.php?id=23385" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1">Kent Game</a></td>
                                        <td>花呗，微信，支付宝，QQ红包</td>
                                        <td>135 RMB</td>
                                        <td><a href="viewtopic.php?id=17427" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1">阿泽服务</a></td>
                                        <td>支付宝/微信/QQ/QIWI/淘宝/PayPal</td>
                                        <td>135 RMB</td>
                                        <td><a href="viewtopic.php?id=17435" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1">Insta Resell</a></td>
                                        <td>PayPal, Bank, Card, Crypto, PSC, Alipay, Pix</td>
                                        <td>24 USD</td>
                                        <td><a href="viewtopic.php?id=25671" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1">Flux HvH</a></td>
                                        <td>支付宝，微信</td>
                                        <td>135 RMB</td>
                                        <td><a href="viewtopic.php?id=45009" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1">Samo's Service</a></td>
                                        <td>PayPal, Giropay, TF2, Crypto, Skrill</td>
                                        <td>24 USD</td>
                                        <td><a href="viewtopic.php?id=43045" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1">Keys & Skins</a></td>
                                        <td>TF2 Keys, PayPal, Skins, BTC, ETH</td>
                                        <td>24 USD</td>
                                        <td><a href="viewtopic.php?id=17477" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1">Online Buy</a></td>
                                        <td>Cards RU/EU/KZ/UA/ASIA, All Crypto</td>
                                        <td>24 USD</td>
                                        <td><a href="viewtopic.php?id=27735" class="button">Purchase</a></td>
                                    </tr>
                                </table>
                                <p>⚠️ Always verify the reseller's profile and reputation before making any payments. Be aware of scammers impersonating verified resellers.</p>
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        `;
    
        managePayments.parentNode.insertBefore(resellerSection, managePayments);
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
            const userLink = e.target.closest('#onlinelist a[href*="profile.php"]');
            if (userLink && !userLink.querySelector('.gs-profile-preview')) {
                const userId = this.getUserIdFromUrl(userLink.href);
                if (userId) {
                    userLink.style.position = 'relative';
                    const preview = await this.createProfilePreview(userId);
                    userLink.appendChild(preview);
                }
            }
        });
    }

    async createProfilePreview(userId) {
        const preview = document.createElement('div');
        preview.className = 'gs-profile-preview';
        preview.innerHTML = '<div class="loading"></div>';

        try {
            const data = await this.fetchProfileData(userId);
            preview.innerHTML = this.getProfilePreviewHTML(userId, data);
        } catch (error) {
            preview.innerHTML = '<div class="error">Failed to load profile</div>';
        }

        return preview;
    }

    getProfilePreviewHTML(userId, data) {
        return `
            <div class="header">
                <div class="username ${data.userClass}">
                    ${data.username}
                    ${data.userClass ? `<i class="fa fa-${this.getUserClassIcon(data.userClass)}"></i>` : ''}
                </div>
                <div class="status">
                    <div class="status-indicator ${data.online ? 'online' : 'offline'}"></div>
                    ${data.online ? 'Online' : 'Offline'}
                </div>
            </div>

            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value">${data.posts}</div>
                    <div class="stat-label">Posts</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.getJoinDate(data.registered)}</div>
                    <div class="stat-label">Joined</div>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <div class="label">Group</div>
                    <div class="value">${data.usergroup}</div>
                </div>
                <div class="info-item">
                    <div class="label">Invited By</div>
                    <div class="value">${data.invitedBy}</div>
                </div>
            </div>

            <div class="actions">
                <a href="pmsnew.php?mdl=post&uid=${userId}" class="action-btn">
                    <i class="fa fa-envelope"></i> PM
                </a>
                <a href="search.php?action=show_user_topics&user_id=${userId}" class="action-btn">
                    <i class="fa fa-list"></i> Topics
                </a>
                <a href="search.php?action=show_user_posts&user_id=${userId}" class="action-btn">
                    <i class="fa fa-comments"></i> Posts
                </a>
            </div>
        `;
    }

    getUserClassIcon(userClass) {
        const icons = {
            'premium': 'star',
            'moderator': 'shield',
            'admin': 'crown'
        };
        return icons[userClass] || 'user';
    }

    getJoinDate(registered) {
        return registered.split(' ')[0];
    }

    getUserIdFromUrl(url) {
        const match = url.match(/id=(\d+)/);
        return match ? match[1] : null;
    }

    async fetchProfileData(userId) {
        if (this.cache[userId]) {
            return this.cache[userId];
        }

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://gamesense.pub/forums/profile.php?id=${userId}`,
                onload: (response) => {
                    try {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');

                        const data = {
                            username: doc.querySelector('.blockform h2')?.textContent.split('-')[0].trim() || 'Unknown',
                            online: document.querySelector('#onlinelist')?.textContent.includes(username) || false,
                            userClass: this.getUserClass(doc),
                            posts: this.getPostCount(doc),
                            registered: this.getRegistrationDate(doc),
                            usergroup: this.getUserGroup(doc),
                            invitedBy: this.getInviter(doc)
                        };

                        this.cache[userId] = data;
                        resolve(data);
                    } catch (error) {
                        reject(error);
                    }
                },
                onerror: reject
            });
        });
    }

    getUserClass(doc) {
        if (doc.querySelector('.usergroup-5')) return 'premium';
        if (doc.querySelector('.usergroup-4')) return 'moderator';
        if (doc.querySelector('.usergroup-1')) return 'admin';
        return '';
    }

    getPostCount(doc) {
        const postsRow = Array.from(doc.querySelectorAll('td')).find(td => 
            td.textContent.includes('Number of posts'));
        return postsRow ? postsRow.nextElementSibling.textContent.trim() : '0';
    }

    getRegistrationDate(doc) {
        const regRow = Array.from(doc.querySelectorAll('td')).find(td => 
            td.textContent.includes('Registered'));
        return regRow ? regRow.nextElementSibling.textContent.trim() : 'Unknown';
    }

    getUserGroup(doc) {
        if (doc.querySelector('.usergroup-5')) return 'Premium';
        if (doc.querySelector('.usergroup-4')) return 'Moderator';
        if (doc.querySelector('.usergroup-1')) return 'Administrator';
        return 'Member';
    }

    getInviter(doc) {
        const inviteRow = Array.from(doc.querySelectorAll('td')).find(td => 
            td.textContent.includes('Invited by'));
        const inviterLink = inviteRow ? inviteRow.nextElementSibling.querySelector('a') : null;
        return inviterLink ? inviterLink.textContent.trim() : 'N/A';
    }
}

window.addEventListener('load', () => new GSEnhancedUI());