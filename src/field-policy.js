/* Pure login-field policy. No DOM access, so it can be unit tested. */
const TP_FIELD_SIGNATURES=Object.freeze({
  autocomplete:Object.freeze({username:['username','email','webauthn'],password:['current-password','new-password'],otp:['one-time-code']}),
  username:/\b(user(name)?|user.?id|userid|login|logon|sign.?in|account|account.?name|member.?id|customer.?id|email|e-mail|mail|email.?address|mobile|mobile.?number|phone|phone.?number|telephone|benutzer(name)?|konto|kundennummer|mitglieder.?id)\b/i,
  password:/\b(pass(word)?|passwd|pwd|pin|kennwort|passwort)\b/i,
  otp:/\b(otp|totp|one.?time|verification.?code|security.?code|authenticator|2fa|mfa|einmalcode|bestätigungscode|sicherheitscode)\b/i,
  exclude:/\b(search|suche|query|filter|contact|kontakt|message|nachricht|subject|betreff|first.?name|last.?name|firstname|lastname|vorname|nachname|street|strasse|straße|city|ort|zip|plz|birthday|geburt|coupon|promo|card.?number|credit.?card)\b/i,
  loginActions:/\b(login|log in|sign in|signin|continue|next|verify|submit|anmelden|einloggen|weiter|bestätigen)\b/i,
  contactActions:/\b(send|senden|submit message|nachricht senden|kontakt)\b/i
});
function autocompleteTokens(value){return String(value||'').toLowerCase().split(/\s+/).filter(Boolean)}
const TP_FIELD_POLICY=Object.freeze({
  signatures:TP_FIELD_SIGNATURES,
  negative:TP_FIELD_SIGNATURES.exclude,
  classify(meta){
    const tokens=autocompleteTokens(meta.autocomplete),text=`${meta.name||''} ${meta.id||''} ${meta.placeholder||''} ${meta.ariaLabel||''} ${meta.testId||''}`.toLowerCase();
    if(meta.type==='password'||tokens.some(x=>TP_FIELD_SIGNATURES.autocomplete.password.includes(x))||TP_FIELD_SIGNATURES.password.test(text))return'password';
    if(tokens.some(x=>TP_FIELD_SIGNATURES.autocomplete.otp.includes(x))||TP_FIELD_SIGNATURES.otp.test(text))return'otp';
    if(meta.type==='search'||TP_FIELD_SIGNATURES.exclude.test(text))return'other';
    if(tokens.some(x=>TP_FIELD_SIGNATURES.autocomplete.username.includes(x)))return'username';
    if(['email','tel'].includes(meta.type)||TP_FIELD_SIGNATURES.username.test(text))return'username';
    return'other';
  },
  allowUsername(meta,context){
    if(this.classify(meta)!=='username')return false;
    if(context.hasPassword||context.loginContext)return true;
    if(context.hasTextarea||context.contactFieldCount>=2||TP_FIELD_SIGNATURES.contactActions.test(context.actionText||''))return false;
    return TP_FIELD_SIGNATURES.loginActions.test(context.actionText||'')||/\/((sign-?in|login|logon|auth|session|account))(\/|$|[?#])/i.test(context.formAction||'')||autocompleteTokens(meta.autocomplete).some(x=>TP_FIELD_SIGNATURES.autocomplete.username.includes(x));
  }
});
globalThis.TP_FIELD_SIGNATURES=TP_FIELD_SIGNATURES;
globalThis.TP_FIELD_POLICY=TP_FIELD_POLICY;
