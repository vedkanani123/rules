# Prop Firm Dossiers — Index

Folder: `propfirm_dossiers/`  
Generated: 2026-09-08  
Source of truth for coverage: `PROP_FIRMS_MASTER_LIST.md` (211 firms) + platform 24 skip list.

## Rules
- **SKIP_PLATFORM** — already ingested in this product (`src/data`). Do not re-fetch.
- **DONE_LIVE** — live-crawled dossier in this folder (12-section TXT).
- **TODO** — not on platform; needs a live dossier here.
- One firm = one `{PascalName}.txt`. Raw crawls under `_raw/{PascalName}/`.
- Do not edit `src/`, `propfirms_complete/`, or `firms_rules/`.

## Counts
- Master list: **211**
- Already on platform (skip fetch): **23**
- Live dossiers written here: **3** (subset of platform: FTMO, FundedNext, E8 Markets)
- Remaining TODO (not on platform): **188**

## Platform 24 (skip — already in product)
- Alpha Capital Group
- Apex Trader Funding
- Aqua Funded
- Atmos Funded
- Blue Guardian
- BrightFunded
- Crypto Fund Trader
- E8 Markets — also DONE_LIVE in this folder
- FTMO — also DONE_LIVE in this folder
- For Traders
- Funded Trading Plus
- FundedElite
- FundedNext — also DONE_LIVE in this folder
- Funding Pips
- Goat Funded Trader
- Hola Prime
- Lark Funding
- Maven Trading
- Moneta Funded
- SharkFunded
- Take Profit Trader
- The5ers
- Top One Trader
- Topstep

## Full roster

| Asset | # | Firm | Website | Dossier file | Status |
|---|---:|---|---|---|---|
| CFD | 1 | 100X Club | https://100x.club/ | `100XClub.txt` | TODO |
| CFD | 2 | AI Prop | https://aiprop.com/ | `AIProp.txt` | TODO |
| CFD | 3 | Alpha Capital Group | https://alphacapitalgroup.uk/ | `AlphaCapitalGroup.txt` | SKIP_PLATFORM |
| CFD | 4 | Alpha Trader Firm | https://alphafunded.com | `AlphaTraderFirm.txt` | TODO |
| CFD | 5 | Aqua Funded | https://aquafunded.com | `AquaFunded.txt` | SKIP_PLATFORM |
| CFD | 6 | ATFunded | https://atfunded.com | `ATFunded.txt` | TODO |
| CFD | 7 | Atlas Funded | https://atlasfunded.com/ | `AtlasFunded.txt` | TODO |
| CFD | 8 | Atmos Funded | https://atmosfunded.com | `AtmosFunded.txt` | SKIP_PLATFORM |
| CFD | 9 | AtmosTraders | https://atmostraders.com | `AtmosTraders.txt` | TODO |
| CFD | 10 | BEM Funding | https://bemfunding.com | `BEMFunding.txt` | TODO |
| CFD | 11 | BestProp4U | https://bestprop4u.com/ | `BestProp4U.txt` | TODO |
| CFD | 12 | Blink Funding | https://blinkfunding.com/ | `BlinkFunding.txt` | TODO |
| CFD | 13 | Blue Guardian | https://blueguardian.com/ | `BlueGuardian.txt` | SKIP_PLATFORM |
| CFD | 14 | Blueberry Funded | https://blueberryfunded.com | `BlueberryFunded.txt` | TODO |
| CFD | 15 | Bridge Funded | https://bridgefunded.com/ | `BridgeFunded.txt` | TODO |
| CFD | 16 | BrightFunded | https://brightfunded.com/ | `BrightFunded.txt` | SKIP_PLATFORM |
| CFD | 17 | Bullwaves Prime | https://www.prime.bullwaves.com/ | `BullwavesPrime.txt` | TODO |
| CFD | 18 | Capital Mint Markets | https://capitalmintmarkets.com/ | `CapitalMintMarkets.txt` | TODO |
| CFD | 19 | City Traders Imperium | https://citytradersimperium.com/ | `CityTradersImperium.txt` | TODO |
| CFD | 20 | DNA Funded | https://dnafunded.com | `DNAFunded.txt` | TODO |
| CFD | 21 | DojoTraders | https://dojotraders.com | `DojoTraders.txt` | TODO |
| CFD | 22 | Dolvero | https://dolvero.com/ | `Dolvero.txt` | TODO |
| CFD | 23 | E2T Prop | https://www.e2tprop.com/ | `E2TProp.txt` | TODO |
| CFD | 24 | E8 Markets | https://e8markets.com | `E8Markets.txt` | DONE_LIVE |
| CFD | 25 | Elites Funding | https://elitesfunding.com | `ElitesFunding.txt` | TODO |
| CFD | 26 | Emerge Profit | https://emergeprofit.com | `EmergeProfit.txt` | TODO |
| CFD | 27 | Evercrest Funding | https://evercrestfunding.com | `EvercrestFunding.txt` | TODO |
| CFD | 28 | EverFunded | https://everfunded.com/ | `EverFunded.txt` | TODO |
| CFD | 29 | Falcon Funded | https://falconfunded.com | `FalconFunded.txt` | TODO |
| CFD | 30 | Fill88 | https://fill88.com/ | `Fill88.txt` | TODO |
| CFD | 31 | Fintokei | https://www.fintokei.com/ | `Fintokei.txt` | TODO |
| CFD | 32 | Firewood Funded | https://funded.firewoodfx.com/en | `FirewoodFunded.txt` | TODO |
| CFD | 33 | Flagship Funded | https://flagshipfunded.com | `FlagshipFunded.txt` | TODO |
| CFD | 34 | For Traders | https://fortraders.com | `ForTraders.txt` | SKIP_PLATFORM |
| CFD | 35 | Forex Funds Flow | https://www.forexfundsflow.com/ | `ForexFundsFlow.txt` | TODO |
| CFD | 36 | Forge of Traders | https://forgeoftraders.com | `ForgeofTraders.txt` | TODO |
| CFD | 37 | Foxx Funded | https://foxx-funded.com/ | `FoxxFunded.txt` | TODO |
| CFD | 38 | FTMO | https://ftmo.com | `FTMO.txt` | DONE_LIVE |
| CFD | 39 | FTUK | https://ftuk.com/ | `FTUK.txt` | TODO |
| CFD | 40 | Funded Academy | https://fundedacademy.com | `FundedAcademy.txt` | TODO |
| CFD | 41 | Funded Daily | https://fundeddaily.com/ | `FundedDaily.txt` | TODO |
| CFD | 42 | Funded Guru | https://funded.guru | `FundedGuru.txt` | TODO |
| CFD | 43 | Funded Traders Global | https://fundedtradersglobal.com/ | `FundedTradersGlobal.txt` | TODO |
| CFD | 44 | Funded Trading Plus | https://www.fundedtradingplus.com/ | `FundedTradingPlus.txt` | SKIP_PLATFORM |
| CFD | 45 | Funded7 | https://funded7.com | `Funded7.txt` | TODO |
| CFD | 46 | FundedBull | https://fundedbull.com/ | `FundedBull.txt` | TODO |
| CFD | 47 | FundedCobra | https://fundedcobra.com/ | `FundedCobra.txt` | TODO |
| CFD | 48 | FundedFast | https://fundedfast.com | `FundedFast.txt` | TODO |
| CFD | 49 | FundedFun | https://fundedfun.com/ | `FundedFun.txt` | TODO |
| CFD | 50 | FundedFX | https://fundedfx.com/ | `FundedFX.txt` | TODO |
| CFD | 51 | FundedNext | https://fundednext.com | `FundedNext.txt` | DONE_LIVE |
| CFD | 52 | FundedPro | https://thefundedpro.com | `FundedPro.txt` | TODO |
| CFD | 53 | FundedVerse | https://www.fundedverse.com/ | `FundedVerse.txt` | TODO |
| CFD | 54 | FunderPro | https://funderpro.com/ | `FunderPro.txt` | TODO |
| CFD | 55 | Funding Pips | https://fundingpips.com/ | `FundingPips.txt` | SKIP_PLATFORM |
| CFD | 56 | Funding Traders | https://fundingtraders.com | `FundingTraders.txt` | TODO |
| CFD | 57 | Funding Your Trades | https://fundingyourtrades.com/ | `FundingYourTrades.txt` | TODO |
| CFD | 58 | FundingRock | https://www.fundingrock.com/ | `FundingRock.txt` | TODO |
| CFD | 59 | FundYourFX | https://fundyourfx.io/ | `FundYourFX.txt` | TODO |
| CFD | 60 | FX2 Funding | https://fx2funding.com/ | `FX2Funding.txt` | TODO |
| CFD | 61 | FXC Funded | https://fxcfunded.com | `FXCFunded.txt` | TODO |
| CFD | 62 | FXIFY | https://fxify.com | `FXIFY.txt` | TODO |
| CFD | 63 | Get Funded Now | https://getfundednow.com/ | `GetFundedNow.txt` | TODO |
| CFD | 64 | Goat Funded Trader | https://goatfundedtrader.com/ | `GoatFundedTrader.txt` | SKIP_PLATFORM |
| CFD | 65 | Hantec Trader | https://htrader.hmarkets.com/ | `HantecTrader.txt` | TODO |
| CFD | 66 | Hex Funded | https://www.hexfunded.com/ | `HexFunded.txt` | TODO |
| CFD | 67 | Hyper Funding | https://thehyperfunding.com/ | `HyperFunding.txt` | TODO |
| CFD | 68 | IC Funded | https://www.icfunded.com | `ICFunded.txt` | TODO |
| CFD | 69 | iFunds.io | https://ifunds.io/ | `iFundsio.txt` | TODO |
| CFD | 70 | Instant Funding | https://instantfunding.com | `InstantFunding.txt` | TODO |
| CFD | 71 | IQ Capital | https://www.iqcapital.io/ | `IQCapital.txt` | TODO |
| CFD | 72 | JoinX Capital | https://joinx.capital/ | `JoinXCapital.txt` | TODO |
| CFD | 73 | Lark Funding | https://larkfunding.com/ | `LarkFunding.txt` | SKIP_PLATFORM |
| CFD | 74 | LegionFunding | https://legionfunding.com | `LegionFunding.txt` | TODO |
| CFD | 75 | Livx Capital | https://livxcapital.com | `LivxCapital.txt` | TODO |
| CFD | 76 | Lux Trading Firm | https://luxtradingfirm.com | `LuxTradingFirm.txt` | TODO |
| CFD | 77 | MasterFunders | https://masterfunders.com/ | `MasterFunders.txt` | TODO |
| CFD | 78 | Maven Trading | https://maventrading.com/ | `MavenTrading.txt` | SKIP_PLATFORM |
| CFD | 79 | Ment Funding | https://mentfunding.com/ | `MentFunding.txt` | TODO |
| CFD | 80 | MFA Traders | https://mfatraders.com/ | `MFATraders.txt` | TODO |
| CFD | 81 | Moneta Funded | https://www.monetafunded.com | `MonetaFunded.txt` | SKIP_PLATFORM |
| CFD | 82 | MyFundedCapital | https://myfundedcapital.com/ | `MyFundedCapital.txt` | TODO |
| CFD | 83 | NEOM Funded | https://neomfunded.com | `NEOMFunded.txt` | TODO |
| CFD | 84 | Next Level Funded | https://www.nextlevelfunded.com/ | `NextLevelFunded.txt` | TODO |
| CFD | 85 | NextGen Funding | https://thenextgenfunding.com | `NextGenFunding.txt` | TODO |
| CFD | 86 | Nordic Funder | https://nordicfunder.com | `NordicFunder.txt` | TODO |
| CFD | 87 | Nova Funded | https://novafunded.com/ | `NovaFunded.txt` | TODO |
| CFD | 88 | NYS Markets | https://nysmarkets.com/ | `NYSMarkets.txt` | TODO |
| CFD | 89 | OFunded | https://ofunded.com/ | `OFunded.txt` | TODO |
| CFD | 90 | One Traders Funding | https://onetradersfunding.com/ | `OneTradersFunding.txt` | TODO |
| CFD | 91 | OneFunded | https://onefunded.com/ | `OneFunded.txt` | TODO |
| CFD | 92 | OneStopProp | https://onestopprop.com | `OneStopProp.txt` | TODO |
| CFD | 93 | Orion Funded | https://orionfunded.com | `OrionFunded.txt` | TODO |
| CFD | 94 | Paid To Trade | https://paidtotrade.net/ | `PaidToTrade.txt` | TODO |
| CFD | 95 | PineX Capital | https://pinexcapital.com | `PineXCapital.txt` | TODO |
| CFD | 96 | Pipcy | https://pipcy.com/ | `Pipcy.txt` | TODO |
| CFD | 97 | Pipstone Capital | https://pipstonecapital.com/ | `PipstoneCapital.txt` | TODO |
| CFD | 98 | Pivex Funded | https://pivexfunded.com/ | `PivexFunded.txt` | TODO |
| CFD | 99 | Propanium | https://propanium.com/ | `Propanium.txt` | TODO |
| CFD | 100 | PropHelix | https://prophelix.com/ | `PropHelix.txt` | TODO |
| CFD | 101 | PropXP | https://propxp.com | `PropXP.txt` | TODO |
| CFD | 102 | Quant Tekel (Ascendx) | https://quanttekel.com/ | `QuantTekelAscendx.txt` | TODO |
| CFD | 103 | Quantum Funding | https://quantumfunding.io/ | `QuantumFunding.txt` | TODO |
| CFD | 104 | RebelsFunding | https://www.rebelsfunding.com | `RebelsFunding.txt` | TODO |
| CFD | 105 | Rhodium FX | https://rhodiumfx.com/ | `RhodiumFX.txt` | TODO |
| CFD | 106 | SabioTrade | https://sabiotrade.com/ | `SabioTrade.txt` | TODO |
| CFD | 107 | SFX Funded | https://sfxfunded.com/ | `SFXFunded.txt` | TODO |
| CFD | 108 | SharkFunded | https://www.sharkfunded.com/ | `SharkFunded.txt` | SKIP_PLATFORM |
| CFD | 109 | SiegPath | https://siegpath.com/ | `SiegPath.txt` | TODO |
| CFD | 110 | Space Funded | https://spacefundedhq.com/ | `SpaceFunded.txt` | TODO |
| CFD | 111 | SuperFunded | https://superfunded.com | `SuperFunded.txt` | TODO |
| CFD | 112 | Sway Funded | https://swayfunded.com | `SwayFunded.txt` | TODO |
| CFD | 113 | T4TCapitalFM | https://t4tcapitalfm.com/ | `T4TCapitalFM.txt` | TODO |
| CFD | 114 | TakeCap FT | https://takecapft.com | `TakeCapFT.txt` | TODO |
| CFD | 115 | TEFS | https://tefs.com/ | `TEFS.txt` | TODO |
| CFD | 116 | Texaris | https://texaris.com/ | `Texaris.txt` | TODO |
| CFD | 117 | The Concept Trading | https://theconcepttrading.com | `TheConceptTrading.txt` | TODO |
| CFD | 118 | The Funded Trader | https://thefundedtraderprogram.com/ | `TheFundedTrader.txt` | TODO |
| CFD | 119 | The Proven Trader | https://theproventrader.com | `TheProvenTrader.txt` | TODO |
| CFD | 120 | The Trading Pit | https://www.thetradingpit.com/ | `TheTradingPit.txt` | TODO |
| CFD | 121 | The5ers | https://www.the5ers.com/ | `The5ers.txt` | SKIP_PLATFORM |
| CFD | 122 | ThinkCapital | https://www.thinkcapital.com | `ThinkCapital.txt` | TODO |
| CFD | 123 | Top One Trader | https://toponetrader.com | `TopOneTrader.txt` | SKIP_PLATFORM |
| CFD | 124 | TopTraderPrime | https://toptraderprime.com/ | `TopTraderPrime.txt` | TODO |
| CFD | 125 | TradeApp | https://tradeapp.com/ | `TradeApp.txt` | TODO |
| CFD | 126 | TradersEdgeFX | https://tradersedgefx.com/ | `TradersEdgeFX.txt` | TODO |
| CFD | 127 | Tradexprop | https://tradexprop.com | `Tradexprop.txt` | TODO |
| CFD | 128 | TX3 Funding | https://www.tx3funding.com | `TX3Funding.txt` | TODO |
| CFD | 129 | Vanta Trading | https://www.vantatrading.io | `VantaTrading.txt` | TODO |
| CFD | 130 | Wall Street Funded | https://wsfunded.com/ | `WallStreetFunded.txt` | TODO |
| CFD | 131 | We Fund You Trade | https://wfyt.com | `WeFundYouTrade.txt` | TODO |
| CFD | 132 | WeGetFunded | https://wegetfunded.com/ | `WeGetFunded.txt` | TODO |
| CFD | 133 | WeMasterTrade | https://wemastertrade.com | `WeMasterTrade.txt` | TODO |
| CFD | 134 | XPIPS | https://xpips.com/ | `XPIPS.txt` | TODO |
| Futures | 1 | 10FOUR | https://10four.com/ | `10FOUR.txt` | TODO |
| Futures | 2 | Alpha Futures | https://alpha-futures.com | `AlphaFutures.txt` | TODO |
| Futures | 3 | Apex Trader Funding | https://apextraderfunding.com | `ApexTraderFunding.txt` | SKIP_PLATFORM |
| Futures | 4 | AquaFutures | https://www.aquafutures.io | `AquaFutures.txt` | TODO |
| Futures | 5 | Astrofund | https://astrofund.io/ | `Astrofund.txt` | TODO |
| Futures | 6 | Blueberry Futures | https://blueberryfutures.com | `BlueberryFutures.txt` | TODO |
| Futures | 7 | BluSky | https://blusky.pro | `BluSky.txt` | TODO |
| Futures | 8 | Bulenox | https://bulenox.com/ | `Bulenox.txt` | TODO |
| Futures | 9 | CypherTicks | https://cypherticks.com/ | `CypherTicks.txt` | TODO |
| Futures | 10 | DayTraders | https://daytraders.com | `DayTraders.txt` | TODO |
| Futures | 11 | Earn2Trade | https://earn2trade.com | `Earn2Trade.txt` | TODO |
| Futures | 12 | Elite Trader Funding | https://elitetraderfunding.com/ | `EliteTraderFunding.txt` | TODO |
| Futures | 13 | Finotive Futures | https://finotivefutures.com/ | `FinotiveFutures.txt` | TODO |
| Futures | 14 | Funded Futures Family | https://fundedfuturesfamily.com | `FundedFuturesFamily.txt` | TODO |
| Futures | 15 | Funded Futures Network | https://www.fundedfuturesnetwork.com | `FundedFuturesNetwork.txt` | TODO |
| Futures | 16 | FundedHero Futures | https://fundedherofutures.com | `FundedHeroFutures.txt` | TODO |
| Futures | 17 | FunderPro Futures | https://funderprofutures.com | `FunderProFutures.txt` | TODO |
| Futures | 18 | FuturesElite | https://futureselite.com | `FuturesElite.txt` | TODO |
| Futures | 19 | FXIFY Futures | https://fxifyfutures.com | `FXIFYFutures.txt` | TODO |
| Futures | 20 | Goat Funded Futures | https://goatfundedfutures.com | `GoatFundedFutures.txt` | TODO |
| Futures | 21 | Halcyon Trader Funding | https://halcyontraderfunding.com/ | `HalcyonTraderFunding.txt` | TODO |
| Futures | 22 | Hola Prime | https://holaprime.com | `HolaPrime.txt` | SKIP_PLATFORM |
| Futures | 23 | Leeloo Trading | https://www.leelootrading.com | `LeelooTrading.txt` | TODO |
| Futures | 24 | Legends Trading | https://thelegendstrading.com/ | `LegendsTrading.txt` | TODO |
| Futures | 25 | Lucid Trading | https://lucidtrading.com | `LucidTrading.txt` | TODO |
| Futures | 26 | MyFundedFutures | https://myfundedfutures.com | `MyFundedFutures.txt` | TODO |
| Futures | 27 | Nexgen ProTrader Funding | https://nexgenprotraderfunding.com | `NexgenProTraderFunding.txt` | TODO |
| Futures | 28 | Nextproptrader | https://nextproptrader.com/ | `Nextproptrader.txt` | TODO |
| Futures | 29 | OneUp Trader | https://www.oneuptrader.com/ | `OneUpTrader.txt` | TODO |
| Futures | 30 | Onyx Futures | https://onyx-futures.com/ | `OnyxFutures.txt` | TODO |
| Futures | 31 | Phoenix Trader Funding | https://phoenixtraderfunding.com | `PhoenixTraderFunding.txt` | TODO |
| Futures | 32 | PropEd Capital | https://propedcapital.com/ | `PropEdCapital.txt` | TODO |
| Futures | 33 | PropShopTrader | https://propshoptrader.com | `PropShopTrader.txt` | TODO |
| Futures | 34 | Purdia Capital | https://purdia.com | `PurdiaCapital.txt` | TODO |
| Futures | 35 | Redline Futures Funding | https://www.redlinefuturesfunding.com/ | `RedlineFuturesFunding.txt` | TODO |
| Futures | 36 | Rev One Trading | https://revonetrading.com | `RevOneTrading.txt` | TODO |
| Futures | 37 | Savius | https://savius.com | `Savius.txt` | TODO |
| Futures | 38 | Shark Futures | https://www.sharkfutures.com | `SharkFutures.txt` | TODO |
| Futures | 39 | Swiss Firmup | https://swissfirmup.com | `SwissFirmup.txt` | TODO |
| Futures | 40 | Take Profit Trader | https://takeprofittrader.com | `TakeProfitTrader.txt` | SKIP_PLATFORM |
| Futures | 41 | Taurus Arena | https://taurusarena.com | `TaurusArena.txt` | TODO |
| Futures | 42 | The TradeMakers | https://thetrademakers.com | `TheTradeMakers.txt` | TODO |
| Futures | 43 | Top One Futures | https://www.toponefutures.com | `TopOneFutures.txt` | TODO |
| Futures | 44 | Topstep | https://topstep.com | `Topstep.txt` | SKIP_PLATFORM |
| Futures | 45 | TradeDay | https://tradeday.com | `TradeDay.txt` | TODO |
| Futures | 46 | TradeFundrr | https://tradefundrr.com/ | `TradeFundrr.txt` | TODO |
| Futures | 47 | Tradeify | https://tradeify.co | `Tradeify.txt` | TODO |
| Futures | 48 | Traders Launch | https://traderslaunch.com/ | `TradersLaunch.txt` | TODO |
| Futures | 49 | TX3 Futures | https://www.tx3futures.com/en | `TX3Futures.txt` | TODO |
| Futures | 50 | Uprofit | https://uprofit.com/ | `Uprofit.txt` | TODO |
| Futures | 51 | Winbance | https://www.winbance.com/ | `Winbance.txt` | TODO |
| Futures | 52 | YRM Prop | https://yrmprop.com | `YRMProp.txt` | TODO |
| Futures | 53 | Zenit Funding | https://www.zenitfunding.com/ | `ZenitFunding.txt` | TODO |
| Crypto | 1 | Breakout | https://www.breakoutprop.com | `Breakout.txt` | TODO |
| Crypto | 2 | Carrot Funding | https://www.carrotfunding.io/ | `CarrotFunding.txt` | TODO |
| Crypto | 3 | Cointracts | https://www.cointracts.com | `Cointracts.txt` | TODO |
| Crypto | 4 | Crypto Fund Trader | https://cryptofundtrader.com/ | `CryptoFundTrader.txt` | SKIP_PLATFORM |
| Crypto | 5 | Fondeo | https://fondeo.xyz | `Fondeo.txt` | TODO |
| Crypto | 6 | Fundedbit | https://fundedbit.com/ | `Fundedbit.txt` | TODO |
| Crypto | 7 | Funding Predicts | https://www.fundingpredicts.com/ | `FundingPredicts.txt` | TODO |
| Crypto | 8 | Hash Hedge | https://www.hashhedge.com/ | `HashHedge.txt` | TODO |
| Crypto | 9 | HUMBPROP | https://humbprop.com | `HUMBPROP.txt` | TODO |
| Crypto | 10 | HyroTrader | https://www.hyrotrader.com | `HyroTrader.txt` | TODO |
| Crypto | 11 | PropFunded | https://propfunded.ai/ | `PropFunded.txt` | TODO |
| Crypto | 12 | PropMarket | https://prop.market/ | `PropMarket.txt` | TODO |
| Crypto | 13 | Propr | https://www.propr.xyz | `Propr.txt` | TODO |
| Crypto | 14 | PropW | https://www.propw.com/en_US | `PropW.txt` | TODO |
| Crypto | 15 | SizeProp | https://www.sizeprop.com | `SizeProp.txt` | TODO |
| Crypto | 16 | Tradeify Crypto | https://tradeifycrypto.co | `TradeifyCrypto.txt` | TODO |
| Crypto | 17 | Upscale | https://upscale.trade/ | `Upscale.txt` | TODO |
| Crypto | 18 | Velotrade | https://velotrade.com/ | `Velotrade.txt` | TODO |
| Crypto | 19 | WarBux | https://warbuxbtc.com | `WarBux.txt` | TODO |
| Crypto | 20 | WenCrypto | https://wencrypto.com/ | `WenCrypto.txt` | TODO |
| Stocks | 1 | Imperial Trader Funding | https://www.imperialtraderfunding.com/ | `ImperialTraderFunding.txt` | TODO |
| Stocks | 2 | Trade The Pool | https://tradethepool.com/ | `TradeThePool.txt` | TODO |
| Stocks | 3 | trader2B | https://trader2b.com | `trader2B.txt` | TODO |
| Stocks | 4 | Vanquish Trader | https://www.vanquishtrader.com/ | `VanquishTrader.txt` | TODO |

## Batch in flight
Wave 1 (30 TODO CFD firms, 10 parallel agents × 3 firms): 100X Club → Foxx Funded.
