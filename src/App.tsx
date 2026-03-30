import { useState } from "react";
import { WalletStatus } from "./WalletStatus";
import { abbreviateAddress, useConnection } from "@evefrontier/dapp-kit";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";

const WORLD_PACKAGE_ID = "0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c";
const BUILDER_PACKAGE_ID = "0xd93bea05f1ed1b56c4ee891574052ab863c37a53126dc2f9664f8a08e8f6c4c8";
const CHARACTER_ID = "0xbb3e3ebe7d40c35b8310d5b023e986424a60c610f087e1ce864cd0760be53ca5";
const AUTH_TYPE = `${BUILDER_PACKAGE_ID}::turret::TurretAuth`;

const TURRETS = [
  { name: "Turret T1", id: "0xf8707963ad3a6c1cc6c470ef7596873740fe5055246188c3173db12b48d27392", ownerCapId: "0xd6dbbae1236274b9ac9a9c4c942b0e78898db7ded73179ad98a97fc169618aa3" },
  { name: "Turret T2", id: "0x1fdaa0a28f6301858a4893270ec1cd80bbe3c736189a088b4cf94825196452d6", ownerCapId: "0x391e0522f0a13b0c054464f1859b7b15d5915cd57ca5a84676adc233a544d140" },
  { name: "Turret T3", id: "0x934e266272b8bac6828f076eb9d7c58d524f827b67b1093923803cc964069754", ownerCapId: "0xc6d5a99854c27ea438e52c3d84e1b0b2b2a2b636c3673857e48c533021b3d390" },
  { name: "Turret T4", id: "0xe16a160a208996a47506d3576e47b8c9690c9cd5efd63b4392b6e70c843173f4", ownerCapId: "0x71dfd08eae4e1ba8742411ac423c1738fc6f4d47d69fbfbb8d8d5a24c9fb6fda" },
  { name: "Heavy Turret", id: "0x83e894da3952ebd62264f0dc32b07c1a2a680913ffcfd0a8657e93cae38f9bc9", ownerCapId: "0xcc1481e6748205b6103fd06286c2c2717bae929788eb810d1def939b456e4945" },
];

const T = {
  en: {
    title: "JGG TURRET CONTROL",
    subtitle: "DEFENSE SYSTEM MANAGER",
    connected: "PILOT AUTHENTICATED",
    notConnected: "CONNECT WITH EVE VAULT",
    disconnect: "DISCONNECT",
    sectionTitle: "AUTHORIZE EXTENSION",
    sectionDesc: "Register turret_extension on each turret",
    register: "AUTHORIZE",
    registering: "AUTHORIZING...",
    success: "AUTHORIZED",
    error: "ERROR",
    noAssembly: "No assembly found",
  },
  ja: {
    title: "JGG タレット管制",
    subtitle: "防衛システム管理",
    connected: "パイロット認証済み",
    notConnected: "EVE Vaultで接続",
    disconnect: "切断",
    sectionTitle: "エクステンション登録",
    sectionDesc: "各タレットにturret_extensionを登録します",
    register: "登録",
    registering: "登録中...",
    success: "登録完了",
    error: "エラー",
    noAssembly: "アセンブリが見つかりません",
  },
};

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#150a04",
    color: "#fafae599",
    fontFamily: "'Favorit', monospace",
    fontSize: "14px",
    letterSpacing: "0.05em",
    position: "relative",
    overflow: "hidden",
  },
  noise: {
    position: "fixed",
    inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 32px",
    borderBottom: "1px solid #ff5c0033",
    position: "relative",
    zIndex: 1,
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2px",
  },
  title: {
    fontSize: "18px",
    color: "#ff5c00",
    fontWeight: "bold",
    letterSpacing: "0.15em",
  },
  subtitle: {
    fontSize: "11px",
    color: "#fafae555",
    letterSpacing: "0.2em",
  },
  headerRight: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  langBtn: {
    background: "transparent",
    border: "1px solid #ff5c0055",
    color: "#ff5c00aa",
    padding: "4px 10px",
    fontSize: "11px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    fontFamily: "'Favorit', monospace",
  },
  langBtnActive: {
    background: "transparent",
    border: "1px solid #ff5c00",
    color: "#ff5c00",
    padding: "4px 10px",
    fontSize: "11px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    fontFamily: "'Favorit', monospace",
  },
  connectBtn: {
    background: "transparent",
    border: "1px solid #ff5c00",
    color: "#ff5c00",
    padding: "8px 20px",
    fontSize: "12px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    fontFamily: "'Favorit', monospace",
    textTransform: "uppercase" as const,
  },
  main: {
    padding: "32px",
    position: "relative",
    zIndex: 1,
  },
  sectionHeader: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "13px",
    color: "#fafae599",
    letterSpacing: "0.2em",
    marginBottom: "4px",
  },
  sectionDesc: {
    fontSize: "11px",
    color: "#fafae544",
    letterSpacing: "0.1em",
  },
  turretGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  turretRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    border: "1px solid #ff5c0022",
    background: "#ff5c0008",
  },
  turretName: {
    fontSize: "13px",
    color: "#fafae588",
    letterSpacing: "0.1em",
  },
  turretId: {
    fontSize: "10px",
    color: "#fafae533",
    fontFamily: "monospace",
    marginTop: "2px",
  },
  authBtn: {
    background: "transparent",
    border: "1px solid #ff5c00",
    color: "#ff5c00",
    padding: "6px 16px",
    fontSize: "11px",
    letterSpacing: "0.1em",
    cursor: "pointer",
    fontFamily: "'Favorit', monospace",
    textTransform: "uppercase" as const,
    minWidth: "100px",
  },
  authBtnDisabled: {
    background: "transparent",
    border: "1px solid #fafae522",
    color: "#fafae533",
    padding: "6px 16px",
    fontSize: "11px",
    letterSpacing: "0.1em",
    cursor: "not-allowed",
    fontFamily: "'Favorit', monospace",
    textTransform: "uppercase" as const,
    minWidth: "100px",
  },
  statusBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 32px",
    borderTop: "1px solid #ff5c0022",
    fontSize: "10px",
    color: "#fafae533",
    fontFamily: "monospace",
    letterSpacing: "0.05em",
    zIndex: 1,
  },
  toast: {
    position: "fixed",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 24px",
    border: "1px solid #ff5c00",
    background: "#150a04",
    color: "#ff5c00",
    fontSize: "12px",
    letterSpacing: "0.1em",
    zIndex: 10,
    whiteSpace: "nowrap" as const,
  },
  toastError: {
    position: "fixed",
    bottom: "40px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 24px",
    border: "1px solid #ff000088",
    background: "#150a04",
    color: "#ff4444",
    fontSize: "12px",
    letterSpacing: "0.1em",
    zIndex: 10,
    whiteSpace: "nowrap" as const,
  },
  walletInfo: {
    fontSize: "11px",
    color: "#ff5c00aa",
    letterSpacing: "0.05em",
  },
};

function App() {
  const { handleConnect, handleDisconnect } = useConnection();
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const [status, setStatus] = useState<{ msg: string; isError: boolean } | null>(null);
  const [lang, setLang] = useState<"en" | "ja">("ja");
  const [loading, setLoading] = useState<string | null>(null);

  const t = T[lang];

  const showToast = (msg: string, isError = false) => {
    setStatus({ msg, isError });
    setTimeout(() => setStatus(null), 4000);
  };

  const authorise = async (turret: typeof TURRETS[0]) => {
    if (!account) return;
    setLoading(turret.id);
    try {
      const tx = new Transaction();
      const [ownerCap, returnReceipt] = tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::character::borrow_owner_cap`,
        typeArguments: [`${WORLD_PACKAGE_ID}::turret::Turret`],
        arguments: [tx.object(CHARACTER_ID), tx.object(turret.ownerCapId)],
      });
      tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::turret::authorize_extension`,
        typeArguments: [AUTH_TYPE],
        arguments: [tx.object(turret.id), ownerCap],
      });
      tx.moveCall({
        target: `${WORLD_PACKAGE_ID}::character::return_owner_cap`,
        typeArguments: [`${WORLD_PACKAGE_ID}::turret::Turret`],
        arguments: [tx.object(CHARACTER_ID), ownerCap, returnReceipt],
      });
      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      showToast(`${turret.name} — ${t.success}: ${result.digest.slice(0, 16)}...`);
    } catch (e: any) {
      showToast(`${t.error}: ${e.message}`, true);
    } finally {
      setLoading(null);
    }
  };

  const scanChars = ["1--n3Sc7", "9-d-Z", "-z-nGV", "eXS-", "9.-g---", "gtFuUXro"];

  return (
    <div style={styles.root}>
      <div style={styles.noise} />

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.title}>{t.title}</div>
          <div style={styles.subtitle}>{t.subtitle}</div>
        </div>
        <div style={styles.headerRight}>
          <button style={lang === "ja" ? styles.langBtnActive : styles.langBtn} onClick={() => setLang("ja")}>JA</button>
          <button style={lang === "en" ? styles.langBtnActive : styles.langBtn} onClick={() => setLang("en")}>EN</button>
          {account ? (
            <>
              <span style={styles.walletInfo}>{abbreviateAddress(account.address)}</span>
              <button style={styles.connectBtn} onClick={handleDisconnect}>{t.disconnect}</button>
            </>
          ) : (
            <button style={styles.connectBtn} onClick={handleConnect}>{t.notConnected}</button>
          )}
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>// {t.sectionTitle}</div>
          <div style={styles.sectionDesc}>{t.sectionDesc}</div>
        </div>
        <div style={styles.turretGrid}>
          {TURRETS.map((turret) => (
            <div key={turret.id} style={styles.turretRow}>
              <div>
                <div style={styles.turretName}>{turret.name.toUpperCase()}</div>
                <div style={styles.turretId}>{turret.id.slice(0, 20)}...</div>
              </div>
              <button
                style={!account || loading === turret.id ? styles.authBtnDisabled : styles.authBtn}
                onClick={() => authorise(turret)}
                disabled={!account || loading === turret.id}
              >
                {loading === turret.id ? t.registering : t.register}
              </button>
            </div>
          ))}
        </div>
      </main>

      <div style={styles.statusBar}>
        {scanChars.map((c, i) => <span key={i}>{c}</span>)}
      </div>

      {status && (
        <div style={status.isError ? styles.toastError : styles.toast}>
          {status.msg}
        </div>
      )}
    </div>
  );
}

export default App;