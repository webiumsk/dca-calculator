<script lang="ts">
  export let translations;
  export let lang: "en" | "sk";

  const lightning = "dca@dvadsatjeden.org";

  let copied = false;

  function copy() {
    navigator.clipboard.writeText(lightning);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<footer class="footer">
  <div class="footer-left"> 
      <span class="api-note">{translations[lang].apiNote}</span>
      <h3>{translations[lang].otherTools}</h3>
      <ul>
        <li><a href="https://vekslak.dvadsatjeden.org" target="_blank" rel="noopener">Vekslák</a></li>
        <li><a href="https://cbdc.icu" target="_blank" rel="noopener">CBDC vs. Bitcoin</a></li>
        <li><a href="https://www.dvadsatjeden.org/vzdelavanie/ostatne/#tab-nstroje" target="_blank" rel="noopener">{translations[lang].more}</a></li>
      </ul>
  </div>
  <div class="footer-center">
    <p class="made">
      {translations[lang].madeWith} <span class="btc">₿</span> {translations[lang].and} <a href="https://www.dvadsatjeden.org" target="_blank" rel="noopener">Dvadsatjeden</a>
    </p>

    <div class="links">
      <a href="https://github.com/webiumsk/dca-calculator" target="_blank" rel="noopener">
        GitHub
      </a>
      <span>•</span>
      <a href="https://njump.me/npub18gh7tx4s28dt9t2hhvd6lrwhsmwg94gnxppkezzq0ucqgscav5ysmqwkad" 
        target="_blank" rel="noopener">
        Nostr
      </a>
      <span>•</span>
      <a href="https://twitter.com/Dvadsatjeden" target="_blank" rel="noopener">
        X / Twitter
      </a>
    </div>
    <p class="license">Open Source • MIT License • 2025</p>    
    
  </div>
  <div class="footer-right">
    <div class="donate">
      <h3>{translations[lang].supportMe} ⚡</h3>

      <img src="/dca-donation.webp" alt="Lightning QR Code" class="qr" />

      <div class="ln-row">
        <a class="ln-btn" href={`lightning:${lightning}`} target="_blank">
          {translations[lang].sendLightning}
        </a>

        <button class="copy-btn" on:click={copy}>
          {#if copied} ✅ {translations[lang].copied} {/if}
          {#if !copied} 📋 {/if}
        </button>
      </div>
    </div>
  </div>
</footer>


<style>
  .footer {
    margin-top: 3rem;
    padding: 2rem 0;
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    flex-wrap: wrap;
    border-top: 1px solid rgba(148, 163, 184, 0.2);
    opacity: 0.9;
  }

  /* Left */
  .footer-left {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Center */
  .footer-center {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
    align-items: center;
  }

  .made {
    font-size: 0.95rem;
  }

  .btc {
    font-weight: 700;
    color: #f7931a;
  }

  .links {
    display: flex;
    gap: 0.5rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
  }

  .links a {
    color: inherit;
    opacity: 0.8;
    text-decoration: none;
  }

  .links a:hover {
    opacity: 1;
  }

  .license {
    font-size: 0.8rem;
    opacity: 0.6;
  }

  /* Right */
  .footer-right {
    display: flex;
    flex-direction: column;
  }

  .donate {
    text-align: center;
  }

  .qr {
    width: 130px;
    margin: 0.5rem auto;
    border-radius: 0.5rem;
  }

  .ln-row {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .ln-btn {
    padding: 0.4rem 0.8rem;
    background: linear-gradient(135deg, #f7931a, #ffb84d);
    color: #111;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
  }

  .copy-btn {
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    border: 1px solid rgba(148,160,184,0.4);
    background: transparent;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .copy-btn:hover {
    background: rgba(255,255,255,0.07);
  }

  .api-note {
    opacity: 0.6;
    font-size: 0.75rem;
    margin-top: 1rem;
  }

  .footer-left ul {
    padding-inline-start: 0;
    list-style-type: none;
    line-height: 2rem;
    margin-top: 0%;
  }

  /* Mobile */
  @media (max-width: 700px) {
    .footer {
        flex-direction: column;
        text-align: center;
    }
    .ln-row {
        justify-content: center;
    }
  }

</style>