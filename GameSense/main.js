class GSEnhancedUI {
    constructor() {
        this.cache = {};
        this.currentTheme = GM_getValue('theme', 'default');
        
        const themeStyles = `
            [data-theme="light-red"] .pun a:link,
            [data-theme="light-red"] .pun a:visited,
            [data-theme="light-red"] .pun .tcl h3 a,
            [data-theme="light-red"] #brdmenu a:link,
            [data-theme="light-red"] #brdmenu a:visited {
                color: #ff4444 !important;
            }
    
            [data-theme="light-red"] .pun a:hover,
            [data-theme="light-red"] .pun a:active,
            [data-theme="light-red"] .pun .tcl h3 a:hover,
            [data-theme="light-red"] #brdmenu a:hover {
                color: #ff6666 !important;
            }
    
            [data-theme="light-orange"] .pun a:link,
            [data-theme="light-orange"] .pun a:visited,
            [data-theme="light-orange"] .pun .tcl h3 a,
            [data-theme="light-orange"] #brdmenu a:link,
            [data-theme="light-orange"] #brdmenu a:visited {
                color: #ffa500 !important;
            }
    
            [data-theme="light-orange"] .pun a:hover,
            [data-theme="light-orange"] .pun a:active,
            [data-theme="light-orange"] .pun .tcl h3 a:hover,
            [data-theme="light-orange"] #brdmenu a:hover {
                color: #ffc04d !important;
            }
        `;
    
        const styleElement = document.createElement('style');
        styleElement.textContent = themeStyles;
        document.head.appendChild(styleElement);
        
        this.init();
    }

    init() {
        this.addThemeToggle();
        this.addCollapsibleCategories();
        this.removeSubscribeLink();
        this.addRollButton();
        this.setupUndercoverMode();
        this.setupResellerList();
        this.setupPremiumUI();
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
        const newTheme = themes[(currentIndex + 1) % themes.length];
        this.currentTheme = newTheme;
        GM_setValue('theme', newTheme);
        document.body.setAttribute('data-theme', newTheme);
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
        const extendGameSense = document.querySelector('.blockform');
        if (!extendGameSense || !window.location.href.includes('payment.php')) return;
    
        const resellerSection = document.createElement('div');
        resellerSection.className = 'blockform';
        resellerSection.innerHTML = `
            <h2>
                <span>
                    <div style="display: flex; align-items: center; cursor: pointer;" class="section-header">
                        <i class="fa fa-magnet" style="margin-right: 8px; transition: transform 0.3s ease"></i>
                        Verified Resellers
                    </div>
                </span>
            </h2>
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
                                        <td><a href="profile.php?id=2933">death1989</a></td>
                                        <td>花呗，微信，支付宝，QQ红包</td>
                                        <td>135 RMB</td>
                                        <td><a href="viewtopic.php?id=17427" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=3031">484481617</a></td>
                                        <td>支付宝/微信/QQ/QIWI/淘宝/PayPal</td>
                                        <td>135 RMB</td>
                                        <td><a href="viewtopic.php?id=17435" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=1699">tiagovski</a></td>
                                        <td>PayPal, Bank, Card, Crypto, PSC, Alipay, Pix</td>
                                        <td>20 EUR</td>
                                        <td><a href="viewtopic.php?id=25671" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=10043">Margele</a></td>
                                        <td>支付宝，微信</td>
                                        <td>148.88 CNY</td>
                                        <td><a href="viewtopic.php?id=45009" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=12434">Samo</a></td>
                                        <td>PayPal, Giropay, TF2, Crypto, Skrill</td>
                                        <td>21 EUR</td>
                                        <td><a href="viewtopic.php?id=43045" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=274">ag96</a></td>
                                        <td>TF2 Keys, PayPal, Skins, BTC, ETH</td>
                                        <td>23.5 USD</td>
                                        <td><a href="viewtopic.php?id=17477" class="button">Purchase</a></td>
                                    </tr>
                                    <tr>
                                        <td><a href="profile.php?id=9060">VKVKF</a></td>
                                        <td>Cards RU/EU/KZ/UA/ASIA, All Crypto</td>
                                        <td>30 USD</td>
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
    
        const firstBlockform = document.querySelector('.blockform');
        firstBlockform.parentNode.insertBefore(resellerSection, firstBlockform.nextSibling);
    
        const addCollapseFunction = (section) => {
            const header = section.querySelector('.section-header');
            const content = section.querySelector('.box');
            const icon = header.querySelector('.fa-magnet');
            
            const isSectionCollapsed = GM_getValue(`section_${header.textContent.trim()}_collapsed`, false);
            if (isSectionCollapsed) {
                content.style.display = 'none';
                icon.style.transform = 'rotate(180deg)';
            }
    
            header.addEventListener('click', () => {
                const isCollapsed = content.style.display === 'none';
                content.style.display = isCollapsed ? '' : 'none';
                icon.style.transform = isCollapsed ? '' : 'rotate(180deg)';
                GM_setValue(`section_${header.textContent.trim()}_collapsed`, !isCollapsed);
            });
        };
    
        document.querySelectorAll('.blockform').forEach(section => {
            const header = section.querySelector('h2');
            if (header && !header.querySelector('.section-header')) {
                const headerContent = header.innerHTML;
                header.innerHTML = `
                    <span>
                        <div style="display: flex; align-items: center; cursor: pointer;" class="section-header">
                            <i class="fa fa-magnet" style="margin-right: 8px; transition: transform 0.3s ease"></i>
                            ${headerContent}
                        </div>
                    </span>
                `;
            }
            addCollapseFunction(section);
        });
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
            magnetIcon.style.cssText = `
                margin-right: 8px;
                transition: transform 0.3s ease;
            `;
            
            const headerWrapper = document.createElement('div');
            headerWrapper.style.cssText = `
                display: flex;
                align-items: center;
                cursor: pointer;
                user-select: none;
            `;
            
            const span = category.querySelector('span');
            if (!span) return;
            
            const content = span.cloneNode(true);
            
            headerWrapper.appendChild(magnetIcon);
            headerWrapper.appendChild(content);
            
            category.innerHTML = '';
            category.appendChild(headerWrapper);
            
            const categoryContent = category.closest('.blocktable');
            const contentBox = categoryContent.querySelector('.box');
            
            headerWrapper.addEventListener('click', () => {
                const isCollapsed = contentBox.style.display === 'none';
                contentBox.style.display = isCollapsed ? '' : 'none';
                magnetIcon.style.transform = isCollapsed ? '' : 'rotate(180deg)';
                
                const categoryText = content.textContent.trim();
                GM_setValue(`category_${categoryText}_collapsed`, !isCollapsed);
            });
            
            const savedState = GM_getValue(`category_${content.textContent.trim()}_collapsed`, false);
            if (savedState) {
                contentBox.style.display = 'none';
                magnetIcon.style.transform = 'rotate(180deg)';
            }
        });
    }

    setupPremiumUI() {
        if (!window.location.href.includes('profile.php')) return;
    
        const styles = `
            .inform {
                margin-bottom: 12px;
            }
    
            .infldset {
                padding: 12px;
            }
    
            .button-group {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }
    
            .button-group .button {
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
    
            .button-group .button i {
                font-size: 12px;
            }
    
            .input-with-button {
                display: flex;
                gap: 8px;
                align-items: center;
            }
    
            .input-with-button input {
                flex: 1;
            }
    
            .contains-error {
                border-color: #ff4444 !important;
            }
    
            .status-text {
                display: flex;
                align-items: center;
                gap: 5px;
                margin-bottom: 8px;
            }
    
            .status-text i {
                color: var(--gs-primary);
                font-size: 14px;
            }
        `;
    
        GM_addStyle(styles);
    
        if (window.location.href.includes('section=premium')) {
            const container = document.querySelector('.blockform .box');
            if (!container) return;
    
            container.innerHTML = `
                <form id="profile8" method="post" action="profile.php?section=premium&id=13793">
                    <input type="hidden" name="form_sent" value="1" />
                    
                    <div class="inform">
                        <fieldset>
                            <legend>Subscription Status</legend>
                            <div class="infldset">
                                <div class="status-text">
                                    <i class="fa fa-clock-o"></i>
                                    <span>Counter-Strike 2 subscription expires on 2024-12-06 08:53:28</span>
                                </div>
                                <div class="button-group">
                                    <a href="payment.php?game=csgo" class="button">
                                        <i class="fa fa-refresh"></i>
                                        Extend Subscription
                                    </a>
                                </div>
                            </div>
                        </fieldset>
                    </div>
    
                    <div class="inform">
                        <fieldset>
                            <legend>Game Clients</legend>
                            <div class="infldset">
                                <div class="button-group">
                                    <button type="submit" name="download_client" class="button">
                                        <i class="fa fa-download"></i>
                                        CS2 Client
                                    </button>
                                    <button type="submit" name="download_client_csgo" class="button">
                                        <i class="fa fa-download"></i>
                                        CS:GO Client
                                    </button>
                                </div>
                            </div>
                        </fieldset>
                    </div>
    
                    <div class="inform">
                        <fieldset>
                            <legend>Discord Management</legend>
                            <div class="infldset">
                                <div class="input-with-button">
                                    <input id="discord_reset_reason" type="text" 
                                           name="discord_reset_reason" 
                                           placeholder="Enter reason for Discord ID reset" 
                                           maxlength="40" />
                                    <button type="submit" name="reset_discord" class="button">
                                        <i class="fa fa-refresh"></i>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </fieldset>
                    </div>
    
                    <div class="inform">
                        <fieldset>
                            <legend>Invite Codes</legend>
                            <div class="infldset">
                                <p>You have no unused invitation codes.</p>
                            </div>
                        </fieldset>
                    </div>
                </form>
            `;
    
            const form = container.querySelector('form');
            form.querySelectorAll(':submit').forEach(button => {
                button.addEventListener('click', function(e) {
                    const discordReason = document.getElementById('discord_reset_reason');
                    
                    if (this.name === 'reset_discord' && discordReason.value.trim() === '') {
                        discordReason.classList.add('contains-error');
                        e.preventDefault();
                        return;
                    }
                    
                    this.disabled = true;
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = this.name;
                    hiddenInput.value = this.value;
                    form.appendChild(hiddenInput);
                });
            });
        }
    }
}

window.addEventListener('load', () => new GSEnhancedUI());