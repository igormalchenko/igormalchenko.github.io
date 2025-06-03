
const authErrors = {
    en: {
      INVALID_SSO_USERNAME: 'Incorrect password. Try again or reset your password if you forgot it.',
      ACCOUNT_ALREADY_REGISTERED: "It seems you already have an account associated with this email. Log in or reset your password if you forgot it.",
      ACCOUNT_IS_BLOCKED: "The account is blocked. For more information, contact support.",
      ACCOUNT_IS_COMPROMISED: "Your account password is outdated. Please update your password.",
      ACCOUNT_IS_FORBIDDEN_TO_LOGIN: "Unable to log in, please contact support.",
      ACCOUNT_IS_UNLIMITED_BLOCKED: "Access to your account is restricted due to self-limitation.",
      ACCOUNT_NOT_FOUND: "It seems the information entered is incorrect, or you don't have an account yet.",
      INVALID_USERNAME_PASSWORD: "Incorrect username or password.",
      UNEXPECTED_ERROR: "An error occurred. Please contact support.",
    },
    uk: {
      INVALID_SSO_USERNAME: 'Неправильний пароль. Спробуй ще раз або скинь пароль, якщо ти його забув.',
      ACCOUNT_ALREADY_REGISTERED: "Схоже, у тебе вже є обліковий запис, пов'язаний із цим e-mail. Увійди в систему або скинь пароль, якщо ти його забув.",
      ACCOUNT_IS_BLOCKED: "Обліковий запис заблоковано. За додатковою інформацією звернися до служби підтримки.",
      ACCOUNT_IS_COMPROMISED: "Пароль твого облікового запису застарів. Будь ласка, заміни його.",
      ACCOUNT_IS_FORBIDDEN_TO_LOGIN: "Неможливо авторизуватися, звернися до служби підтримки.",
      ACCOUNT_IS_UNLIMITED_BLOCKED: "Доступ до твого облікового запису закрито через самообмеження.",
      ACCOUNT_NOT_FOUND: "Схоже, дані введено некоректно або у тебе ще немає облікового запису.",
      INVALID_USERNAME_PASSWORD: "Неправильно вказано логін або пароль.",
      UNEXPECTED_ERROR: "Сталася помилка. Звернися до служби підтримки.",
    },
    ru: {
      INVALID_SSO_USERNAME: 'Неправильный пароль. Попробуй еще раз или сбрось пароль, если ты забыл его.',
      ACCOUNT_ALREADY_REGISTERED: "Похоже, у тебя уже есть учетная запись, связанная с этим e-mail. Войди в систему или сбрось пароль, если ты забыл его.",
      ACCOUNT_IS_BLOCKED: "Аккаунт заблокирован. За дополнительной информацией обратись в службу поддержки.",
      ACCOUNT_IS_COMPROMISED: "Пароль вашего аккаунта устарел. Просим заменить пароль.",
      ACCOUNT_IS_FORBIDDEN_TO_LOGIN: "Невозможно авторизоваться, свяжись со службой поддержки",
      ACCOUNT_IS_UNLIMITED_BLOCKED: "Доступ к твоему аккаунту закрыт в связи с самоограничением",
      ACCOUNT_NOT_FOUND: "Похоже, данные введены некорректно или у тебя еще нет аккаунта",
      INVALID_USERNAME_PASSWORD: "Неверно указан логин или пароль",
      UNEXPECTED_ERROR: "Произошла ошибка. Обратись в службу поддержки",
    }
  };
  
  const getAuthErrors = (errors) => {
    // const language = navigator.language;
    // const shortLanguage = language.split('-')[0];
    const lang = document.documentElement.lang.length ? document.documentElement.lang.slice(0, 2).toLowerCase() : "uk";
    return errors[lang] || errors['en'];
  }
  
  const localizedAuthErrors = getAuthErrors(authErrors);
  
  function formatApgUrl() {
    try {
      const currentUrl = window.location.protocol + '//' + window.location.hostname.replace( /^[^.]+/ , 'apg') + '/';
      
      return currentUrl.toString();
    } catch (error) {
      console.error("Failed to format URL:", error);
      return null;
    }
  }
  
  const requestSettings = {
    registrationUrl: `${formatApgUrl()}v0/identity/registration/byform`, // 'https://apg.testlanding.online/v0/identity/registration/byform',
    loginUrl: `${formatApgUrl()}v0/identity/login`, // 'https://apg.testlanding.online/v0/identity/login'
    socialRegistrationUrl: `${formatApgUrl()}v0/identity/login/external/continue`, //'https://apg.testlanding.online/v0/identity/login/external/continue'
    apiKey: 'fe7a70d1-4726-4f94-98a6-53b46f4586c0',
  }
  
  const fpPromise = import('https://openfpcdn.io/fingerprintjs/v4').then(FingerprintJS => FingerprintJS.load());
  fpPromise
      .then(fp => fp.get())
      .then(result => {
        // This is the visitor identifier:
        window.v_id = result.visitorId;
      })
      .catch(error => console.error(error));
  
  const saveMode = true;
  
  function transformPhoneNumber(phoneNumber) {
    // Remove all non-numeric characters using regex
    return phoneNumber.replace(/[^\d+]/g, '');
  }
  
  /** Helper for sending request **/
  async function sendApiRequest(
      data,
      successCallback = (response) => {
        successCbck(response)
      },
      errorCallback = (response) => {
        errorCbck(response)
      },
      actionCallback = (response) => {
        actionCbck(response)
      }) {
  
    loader("body", "show");
    toggleRequestClass("body");
    //test
    const registrationHeaders = new Headers();
    registrationHeaders.append('Content-Type',  'application/json');
    registrationHeaders.append('X-Api-Key',  requestSettings.apiKey || '');
    registrationHeaders.append('X-ClientId',  window.v_id || '');
    registrationHeaders.append('X-Channel',  getXChannel() || '');
    registrationHeaders.append('X-Response-Error',  'true');
    registrationHeaders.append('X-Landing',  'true');
    registrationHeaders.append('X-VerificationLinkVersion',  '2');
    registrationHeaders.append('X-IncludeLogin',  'true');
  
    const loginHeaders = new Headers();
    loginHeaders.append('Content-Type',  'application/json');
    loginHeaders.append('X-Api-Key',  requestSettings.apiKey || '');
    loginHeaders.append('X-ClientId',  window.v_id || '');
    loginHeaders.append('X-Channel',  getXChannel() || '');
    loginHeaders.append('X-Response-Error',  'true');
    loginHeaders.append('X-Landing',  'true');
  
  
    if (typeof data['defaultCurrency'] === 'undefined')
      data['defaultCurrency'] = 'UAH';
  
    if (typeof data['selectedLanguage'] === 'undefined')
      data['selectedLanguage'] = 'uk';
  
    if (data['isBonusActivated'])
      data['isBonusActivated'] = true;
  
    if (data['phone'])
      data['phone'] = transformPhoneNumber(data['phone']);
  
    if (data['apiKey'])
      delete data['apiKey'];
  
    // Login request
    if (data['login']) {
      try {
        let response = await fetch(requestSettings.loginUrl.toString(), {
          method: "POST",
          headers: loginHeaders,
          credentials: "include",
          body: JSON.stringify({
            ...data,
          }),
        })
        if (response.ok) {
          const responseData =  await response.json();
          loader("body", "hide");
  
          const domain = window.location.hostname.replace('bonus.', '');
          responseData.redirectDomain = `https://${domain}`;
          document.cookie = `thirdPartyAuthToken=${responseData.token}; domain=${domain};path=/;Secure`;
          document.cookie = `airToken=${responseData.token}; domain=${domain};path=/;Secure`;
  
  
          if (typeof sendStat === "function") {
            sendStat({
              'event': 'login',
              'eventCategory': 'login',
              'eventAction': 'login_success',
              'landing_page_url': window.location.href,
              'landing_type': window.landing_type ? window.landing_type : '',
              'user_id_hash': responseData.account_hash || '',
            });
  
            try {
              if (typeof MTFEF !== "undefined" && typeof MTFEF.registerCallback === "function") {
                MTFEF.registerCallback()
              }
            } catch (e) {
              console.log(e);
            }
          }
  
          const accInfo = ['phone', 'phoneCountry', 'email', 'currency', 'accountEnter', 'blockTime'];
  
          accInfo.forEach((item) => {
            if (localStorage.getItem(item)) {
              localStorage.removeItem(item);
            }
          });
  
  
          successCallback(responseData);
        } else {
          const errorData =  await response.json();
          sendStat({
            'event': 'login',
            'eventCategory': 'login',
            'eventAction': 'login_error',
            'error_text': errorData && errorData.modelError ? errorData.modelError.localizeKey : '',
            'landing_page_url': window.location.href,
            'landing_type': window.landing_type ? window.landing_type : ''
          });
          loader("body", "hide");
          errorCallback({error: true, message: localizedAuthErrors[errorData.modelError.localizeKey]});
        }
  
      } catch (error) {
        loader("body", "hide");
        errorCallback({error: true, message: localizedAuthErrors['UNEXPECTED_ERROR']});
      }
  
      setTimeout(function () {
        toggleRequestClass("body");
      }, 1000);
    } else {
      // Registration request
  
      const requestUrl = !data['idToken'] ? requestSettings.registrationUrl : requestSettings.socialRegistrationUrl;
      if (!data['idToken']) {
        data['formName'] = data['email'] ? 'PRJ4_REGISTRATIONBYEMAIL' : 'PRJ4_REGISTRATIONBYPHONE';
      } else {
        delete data['formName'];
      }
      try {
        let response = await fetch(requestUrl.toString(), {
          method: "POST",
          credentials: "include",
          headers: registrationHeaders,
          body: JSON.stringify({
            ...data,
          }),
        })
        if (response.ok) {
          const responseData =  await response.json();
          loader("body", "hide");
  
          const domain = window.location.hostname.replace('bonus.', '');
          responseData.redirectDomain = `https://${domain}`;
          document.cookie = `thirdPartyAuthToken=${responseData.token}; domain=${domain};path=/;Secure`;
          document.cookie = `airToken=${responseData.token}; domain=${domain};path=/;Secure`;
  
          if (typeof sendStat === "function") {
            sendStat({
              'event': 'registration',
              'eventCategory': 'registration',
              'eventAction': 'registration_success',
              'landing_page_url': window.location.href,
              'reg_type': window.nnBonus || 'landing',
              'landing_type': window.landing_type ? window.landing_type : '',
              'user_id_hash': responseData.account_hash || '',
            });
            try {
              if (typeof MTFEF !== "undefined" && typeof MTFEF.registerCallback === "function") {
                MTFEF.registerCallback()
              }
            } catch (e) {
              console.log(e);
            }
          }
  
          const accInfo = ['phone', 'phoneCountry', 'email', 'currency', 'accountEnter', 'blockTime'];
  
          accInfo.forEach((item) => {
            if (localStorage.getItem(item)) {
              localStorage.removeItem(item);
            }
          });
  
          successCallback(responseData);
        } else {
          const errorData =  await response.json();
          if (typeof sendStat === "function") {
            sendStat({
              'event': 'registration',
              'eventCategory': 'registration',
              'eventAction': 'registration_error',
              'reg_type': window.nnBonus || 'landing',
              'error_text': errorData && errorData.modelError ? errorData.modelError.localizeKey : '',
              'landing_page_url': window.location.href,
              'landing_type': window.landing_type ? window.landing_type : '',
            });
          }
          console.log('errorData', errorData);
          loader("body", "hide");
          errorCallback({error: true, message: localizedAuthErrors[errorData.modelError.localizeKey]});
        }
      } catch (e) {
        loader("body", "hide");
        errorCallback({error: true, message: localizedAuthErrors['UNEXPECTED_ERROR']});
      }
  
      setTimeout(function () {
        toggleRequestClass("body");
      }, 1000);
    }
  }
  
  /** Callback for success response */
  function successCbck(response) {
    console.log(response);
  }
  
  /** Callback for error response */
  function errorCbck(response) {
    let msg = " Error callback triggered : " + response.message;
    console.log(msg);
  }
  
  /** Callback for action response */
  function actionCbck(response) {
    console.log(response);
  }
  
  
  /** Form serializing **/
  function getFormData($form) {
    let unindexed_array = $form.serializeArray(),
        indexed_array = {};
  
    unindexed_array.map((n)=>{
      indexed_array[n['name']] = n['value'];
    });
  
    /** Add marketingMeta for reg **/
    indexed_array['marketingMeta'] = collectCookies();
  
    return Object.assign(getLastCookie(), indexed_array);
  }
  
  /** Loader toggle function **/
  function loader(wrapperCls, state) {
    const LOADER_CLASS = "js-loader";
    const IS_LOADING_CLASS = "is-loading";
    const loaderTpl = `<div class="c-loader ${LOADER_CLASS} ${IS_LOADING_CLASS}">
                         <div class="c-loader__content">
                           <img src="/common/img/loader_p.svg" class="c-loader__item" alt="loader">  
                         </div>
                       </div>`;
  
    if (state === "show") {
      const wrapper = document.getElementsByTagName(wrapperCls)[0];
      wrapper.insertAdjacentHTML("afterbegin", loaderTpl);
    } else if (state === "hide") {
      const loader = document.querySelector(`.${LOADER_CLASS}`);
      loader.classList.remove(`.${IS_LOADING_CLASS}`);
      setTimeout(() => loader.parentNode.removeChild(loader), 300);
    } else {
      console.log("Unrecognized state");
    }
  }
  
  function toggleRequestClass(cls) {
    const item = document.querySelector(cls);
    item.classList.toggle('is-request');
  }
  
  
  /** Cookies **/
  function getCookie(name) {
    return window.MTFEF && window.MTFEF.getCookie(name);
  }
  
  function collectCookies() {
    // MarketingTech Framework integration
    if (window.MTFEF && window.MTFEF.collectSources) {
      try {
        let sources = window.MTFEF.collectSources();
        if (sources) {
          // Nested JSON Object .
          return sources;
        }
      } catch (e) {
        console.log(e);
      }
    }
  
    let cookieSet = {
      'adtag': getCookie('adtag'),
      'btag': getCookie('pm_btag'),
      'siteid': getCookie('pm_siteid'),
      'qtag': getCookie('qtag'),
      'adtag_t': getCookie('adtag_t'),
      'btag_t': getCookie('btag_t'),
      'qtag_t': getCookie('qtag_t'),
      'org': getCookie('org'),
      'org_t': getCookie('org_t'),
      'sourceURL': getCookie('sourceUrl'),
      'iohash': getCookie('iohash')
  
    };
  
    for (let key in cookieSet) {
      if (typeof cookieSet[key] === "undefined")
        delete cookieSet[key];
    }
  
    return cookieSet;
  }
  
  function getLastCookie() {
    let data = {},
        lastCookieTime = 0,
        adtag_t = getCookie('adtag_t'),
        btag_t = getCookie('btag_t'),
        qtag_t = getCookie('qtag_t');
  
    adtag_t = typeof adtag_t !== 'undefined' ? parseInt(adtag_t) : 0;
    btag_t = typeof btag_t !== 'undefined' ? parseInt(btag_t) : 0;
    qtag_t = typeof qtag_t !== 'undefined' ? parseInt(qtag_t) : 0;
  
    lastCookieTime = Math.max(adtag_t, btag_t, qtag_t);
  
    // switch (lastCookieTime) {
    //   case qtag_t:
    //     data['qtag'] = getCookie('qtag');
    //     break;
    //   case btag_t:
    //     data['btag'] = getCookie('pm_btag');
    //     break;
    //   case adtag_t:
    //     data['adtag'] = getCookie('adtag');
    //     break;
    // }
  
    return data;
  }
  
  
  /** sending stats */
  function sendStat(data) {
    if (typeof dataLayer !== "undefined" && typeof data === "object") {
      dataLayer.push(data);
    }
  }
  
  function getXChannel() {
    const VIEW_MODES = {
      SIMPLE: 'simple',
      WIDE: 'wide',
    };
  
    //wideViewThreshold
    const wideViewThreshold = 1280;
  
    //rules
    const rules = [
      'WebView',
      '(iPhone|iPod|iPad)(?!.*Safari)',
      'Android.*(wv|.0.0.0)',
      'Linux; U; Android',
    ];
  
    //pwa.installed
    const isInStandaloneMode = () =>
        ('standalone' in window.navigator && window.navigator.standalone) ||
        window.matchMedia('(display-mode: standalone)').matches;
  
    const getViewMode = () => window.innerWidth < wideViewThreshold ? VIEW_MODES.SIMPLE : VIEW_MODES.WIDE;
  
    const checkUserAgent = (regExp, userAgentRaw) => {
      const userAgent = userAgentRaw.toLowerCase();
  
      if (!(regExp || regExp instanceof RegExp)) {
        throw new Error(
            `${JSON.stringify(
                regExp,
            )} isn't instance of RegExp, need pass only instance ofRegExp - /xxx/ or new RegExp('xxx', flags)`,
        );
      }
  
      return regExp.test(userAgent);
    };
  
    const isWebView = () =>
        checkUserAgent(
            new RegExp(`(${rules.join('|')})`, 'i'),
            window.navigator.userAgent,
        ) && !window.navigator.userAgent.toLocaleLowerCase().includes('build');
  
  
    const getChannel = (viewMode, pwa, webView) => {
      const isWideView = viewMode === VIEW_MODES.WIDE;
  
      if (webView) {
        return 'MOBILE_WEB';
      }
  
      if (pwa) {
        return 'PWA';
      }
  
      if (isWideView) {
        return 'DESKTOP_AIR_PM';
      }
  
      return 'MOBILE_WEB';
    };
  
    return getChannel(getViewMode(), isInStandaloneMode(), isWebView());
  }
  
  if (saveMode) {
    function setPhoneEmail(item) {
      const $this = item;
      if ($this.getAttribute('name') === 'phone') {
        const phoneValue = $this.value;
        const phoneSelect = document.getElementById("phone_code");
        const phoneCountry = phoneSelect.options[phoneSelect.selectedIndex].getAttribute("data-countrycode");
        localStorage.setItem('phone', phoneValue);
        localStorage.setItem('phoneCountry', phoneCountry);
      } else if ($this.getAttribute('type') === 'email') {
        const emailValue = $this.value.length > 0 ? $this.value : '';
        localStorage.setItem('email', emailValue);
      }
      const CurrentTime = new Date();
      CurrentTime.setMinutes(CurrentTime.getMinutes() + 15);
      localStorage.setItem('blockTime', +CurrentTime);
    }
  
    function setUsersInfo() {
      const inputs = document.querySelectorAll('input');
      const selects = document.querySelectorAll('select');
  
      const typeChange = document.querySelectorAll('.js-btn-type-change');
  
      if (typeChange.length) {
        typeChange[0].nextElementSibling.addEventListener('change', () => {
          setPhoneEmail(typeChange[0].nextElementSibling);
        });
      }
  
      inputs.forEach((input) => {
        if (input.getAttribute("name") === 'phone') {
          input.onchange = () => {
            if (input.getAttribute("name") === 'phone') {
              const phoneValue = input.value;
              const phoneSelect = document.getElementById("phone_code");
              const phoneCountry = phoneSelect.options[phoneSelect.selectedIndex].getAttribute("data-countrycode");
              localStorage.setItem('phone', phoneValue);
              localStorage.setItem('phoneCountry', phoneCountry);
              const CurrentTime = new Date();
              CurrentTime.setMinutes(CurrentTime.getMinutes() + 15);
              localStorage.setItem('blockTime', +CurrentTime);
            }
            if (input.getAttribute("name") === 'email') {
              const emailValue = input.value.length > 0 ? input.value : '';
              localStorage.setItem('email', emailValue);
              const CurrentTime = new Date();
              CurrentTime.setMinutes(CurrentTime.getMinutes() + 15);
              localStorage.setItem('blockTime', +CurrentTime);
            }
          };
        }
  
        if (input.getAttribute("type") === 'email') {
          input.addEventListener('change', () => {
            const emailValue = input.value.length > 0 ? input.value : '';
            localStorage.setItem('email', emailValue);
            const CurrentTime = new Date();
            CurrentTime.setMinutes(CurrentTime.getMinutes() + 15);
            localStorage.setItem('blockTime', +CurrentTime);
          });
        }
  
        if (input.getAttribute("name") === 'login') {
          input.addEventListener('change', () => {
            const accValue = input.value.length > 0 ? input.value : '';
            localStorage.setItem('accountEnter', accValue);
            const CurrentTime = new Date();
            CurrentTime.setMinutes(CurrentTime.getMinutes() + 15);
            localStorage.setItem('blockTime', +CurrentTime);
          });
        }
  
      });
  
      selects.forEach((select) => {
        if (select.getAttribute('name') === 'defaultCurrency') {
          select.addEventListener('change', () => {
            const currencyValue = select.value;
            localStorage.setItem('currency', currencyValue);
          })
        }
      });
    }
  
  // block time
    (function () {
      const blockTime = localStorage.getItem('blockTime');
      if (blockTime !== null) {
  
        if (+new Date() >= parseInt(blockTime)) {
          localStorage.removeItem('phone');
          localStorage.removeItem('phoneCountry');
          localStorage.removeItem('email');
          localStorage.removeItem('currency');
          localStorage.removeItem('accountEnter');
          localStorage.removeItem('blockTime');
        }
      }
    })();
  
    document.addEventListener('DOMContentLoaded', function(){
      const inputs = document.querySelectorAll('input');
      const selects = document.querySelectorAll('select');
  
      const phoneValue = localStorage.getItem('phone');
      const emailValue = localStorage.getItem('email');
      const currencyValue = localStorage.getItem('currency');
      const accValue = localStorage.getItem('accountEnter');
  
      inputs.forEach((input) => {
        if (phoneValue && input.getAttribute("name") === 'phone') {
          setTimeout(() => {
            input.value = phoneValue;
            input.setAttribute("data-valid", true);
            input.closest('.c-form__group').classList.add('focused');
          }, 500);
        }
  
        if (phoneValue && input.getAttribute("type") === 'email') {
          const emailBlock = document.querySelector('.form_box--email');
          if (emailBlock) {
            emailBlock.classList.add('statick');
          }
          setTimeout(() => {
            input.value = emailValue;
            input.setAttribute("data-valid", true);
            input.closest('.c-form__group').classList.add('focused');
          }, 500);
        }
  
        if (accValue && input.getAttribute("name") === 'login') {
          const accValue = localStorage.getItem('accountEnter');
          setTimeout(() => {
            input.value = accValue;
            input.setAttribute("data-valid", true);
            input.closest('.c-form__group').classList.add('focused');
          }, 500);
        }
      });
  
      selects.forEach((select) => {
        if (currencyValue && select.getAttribute('name') === 'defaultCurrency') {
          setTimeout(() => {
            select.value = currencyValue;
            select.setAttribute("data-valid", true);
            select.closest('.c-form__group').classList.add('focused');
          }, 500);
        }
      });
  
      setUsersInfo();
  
    });
  }
  