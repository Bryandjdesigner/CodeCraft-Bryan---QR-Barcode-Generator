import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { toPng } from 'html-to-image';
import { 
  QrCode, 
  Barcode, 
  Download, 
  MessageSquare, 
  Instagram, 
  Type as TypeIcon, 
  Settings2, 
  RefreshCw,
  Copy,
  CheckCircle2,
  ExternalLink,
  Coffee,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

type CodeType = 'qrcode' | 'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF14' | 'CODABAR';
type DataType = 'text' | 'whatsapp' | 'instagram';

export default function App() {
  const [codeType, setCodeType] = useState<CodeType>('qrcode');
  const [dataType, setDataType] = useState<DataType>('text');
  const [itemName, setItemName] = useState('');
  const [data, setData] = useState('');
  
  // WhatsApp State
  const [waPhone, setWaPhone] = useState('');
  const [waMessage, setWaMessage] = useState('');
  
  // Instagram State
  const [igUsername, setIgUsername] = useState('');
  
  // Customization
  const [qrSize, setQrSize] = useState(300);
  const [qrColor, setQrColor] = useState('#000000');
  const [barcodeWidth, setBarcodeWidth] = useState(2);
  const [barcodeHeight, setBarcodeHeight] = useState(100);
  const [barcodeColor, setBarcodeColor] = useState('#000000');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const outputRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (codeType !== 'qrcode' && generated && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, data, {
          format: codeType,
          width: barcodeWidth,
          height: barcodeHeight,
          displayValue: true,
          lineColor: barcodeColor,
          background: '#ffffff',
          margin: 10
        });
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }
  }, [codeType, data, barcodeWidth, barcodeHeight, barcodeColor, generated]);

  const handleGenerate = () => {
    let finalData = '';
    if (dataType === 'whatsapp') {
      if (!waPhone) return;
      finalData = `https://wa.me/${waPhone.replace(/\D/g, '')}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ''}`;
    } else if (dataType === 'instagram') {
      if (!igUsername) return;
      finalData = `https://instagram.com/${igUsername.replace('@', '')}`;
    } else {
      finalData = data;
    }

    if (!finalData) {
      alert('Por favor, insira os dados para gerar o código.');
      return;
    }

    setIsGenerating(true);
    
    // Small timeout to show loading state and ensure clean render
    setTimeout(() => {
      setData(finalData);
      setGenerated(true);
      setIsGenerating(false);
      
      // Scroll to result on mobile
      if (window.innerWidth < 1024) {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 300);
  };

  const handleDownload = async () => {
    if (!outputRef.current) return;
    
    setIsGenerating(true);
    try {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(outputRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2, // Reduced from 3 for better mobile compatibility
        cacheBust: true,
      });
      
      const filename = `${itemName || 'code'}-${Date.now()}.png`;
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
      alert('Erro ao baixar imagem. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!outputRef.current) return;
    
    try {
      const dataUrl = await toPng(outputRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'code.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: itemName || 'Meu Código',
          text: 'Gerado via CodeCraft-Bryan',
        });
      } else {
        handleCopyLink();
      }
    } catch (err) {
      console.error('Share failed', err);
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen grid-pattern selection:bg-indigo-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">CodeCraft-Bryan</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Professional Generator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
              <Coffee className="w-4 h-4" />
              Apoie o Projeto
            </button>
            <div className="h-4 w-px bg-zinc-800 hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">System Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start">
          {/* Left Panel: Controls */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Settings2 className="w-4 h-4" />
                <h2 className="text-sm font-semibold uppercase tracking-wider">Configurações</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500 ml-1">Tipo de Código</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setCodeType('qrcode'); setGenerated(false); }}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-medium",
                        codeType === 'qrcode' 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      )}
                    >
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </button>
                    <button 
                      onClick={() => { setCodeType('CODE128'); setGenerated(false); }}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-medium",
                        codeType !== 'qrcode' 
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      )}
                    >
                      <Barcode className="w-4 h-4" />
                      Barras
                    </button>
                  </div>
                </div>

                {codeType !== 'qrcode' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 ml-1">Formato de Barras</label>
                    <select 
                      value={codeType}
                      onChange={(e) => { setCodeType(e.target.value as CodeType); setGenerated(false); }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="CODE128">Code 128 (Padrão)</option>
                      <option value="EAN13">EAN-13 (Produtos)</option>
                      <option value="UPC">UPC-A (Produtos)</option>
                      <option value="CODE39">Code 39</option>
                      <option value="ITF14">ITF-14</option>
                      <option value="CODABAR">Codabar</option>
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500 ml-1">Tipo de Conteúdo</label>
                  <div className="flex p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                    <button 
                      onClick={() => setDataType('text')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                        dataType === 'text' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <TypeIcon className="w-3.5 h-3.5" />
                      Texto
                    </button>
                    <button 
                      onClick={() => setDataType('whatsapp')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                        dataType === 'whatsapp' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => setDataType('instagram')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                        dataType === 'instagram' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      Instagram
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 ml-1">Nome do Item (Opcional)</label>
                    <input 
                      type="text"
                      placeholder="Ex: Produto A, Link Bio..."
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  {dataType === 'text' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 ml-1">Conteúdo</label>
                      <textarea 
                        rows={3}
                        placeholder="Digite o texto ou URL..."
                        value={data}
                        onChange={(e) => setData(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      />
                    </div>
                  )}

                  {dataType === 'whatsapp' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 ml-1">Número (com DDD)</label>
                        <input 
                          type="tel"
                          placeholder="Ex: 5511999999999"
                          value={waPhone}
                          onChange={(e) => setWaPhone(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 ml-1">Mensagem Inicial</label>
                        <input 
                          type="text"
                          placeholder="Olá, gostaria de saber mais..."
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {dataType === 'instagram' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 ml-1">Usuário Instagram</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">@</span>
                        <input 
                          type="text"
                          placeholder="seu_usuario"
                          value={igUsername}
                          onChange={(e) => setIgUsername(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Gerar Código
                        <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            <section className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Personalização</h3>
              
              {codeType === 'qrcode' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase">Tamanho</label>
                    <select 
                      value={qrSize}
                      onChange={(e) => setQrSize(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none"
                    >
                      <option value={200}>200px</option>
                      <option value={300}>300px</option>
                      <option value={400}>400px</option>
                      <option value={1000}>1000px (HD)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase">Cor</label>
                    <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1">
                      <input 
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-6 h-6 bg-transparent border-none cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-zinc-400">{qrColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase">Largura</label>
                      <select 
                        value={barcodeWidth}
                        onChange={(e) => setBarcodeWidth(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none"
                      >
                        <option value={1}>Fino</option>
                        <option value={2}>Médio</option>
                        <option value={3}>Grosso</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase">Altura</label>
                      <select 
                        value={barcodeHeight}
                        onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none"
                      >
                        <option value={50}>50px</option>
                        <option value={100}>100px</option>
                        <option value={150}>150px</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase">Cor das Linhas</label>
                    <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1">
                      <input 
                        type="color"
                        value={barcodeColor}
                        onChange={(e) => setBarcodeColor(e.target.value)}
                        className="w-6 h-6 bg-transparent border-none cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-zinc-400">{barcodeColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </motion.div>

          {/* Right Panel: Preview */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[32px] p-6 md:p-12 min-h-[350px] md:min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full blur-[100px]" />
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-500 rounded-full blur-[100px]" />
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin" />
                  <p className="text-zinc-400 font-medium animate-pulse">Gerando seu código...</p>
                </div>
              ) : generated ? (
                <div className="w-full max-w-md space-y-8 flex flex-col items-center">
                  {/* The Downloadable Area */}
                  <div 
                    ref={outputRef}
                    className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 md:gap-6 w-fit mx-auto"
                  >
                    {itemName && (
                      <h3 className="text-zinc-900 font-bold text-lg md:text-xl tracking-tight text-center max-w-[200px] md:max-w-xs break-words">
                        {itemName}
                      </h3>
                    )}
                    
                    <div className="bg-white p-2 flex items-center justify-center min-h-[150px]">
                      {codeType === 'qrcode' ? (
                        <div className="w-full flex justify-center">
                          <QRCodeCanvas 
                            value={data}
                            size={qrSize > 512 ? 512 : qrSize}
                            fgColor={qrColor}
                            level="H"
                            includeMargin={false}
                            style={{ width: '100%', height: 'auto', maxWidth: '300px' }}
                          />
                        </div>
                      ) : (
                        <div className="overflow-x-auto max-w-full bg-white flex justify-center">
                          <svg ref={barcodeRef}></svg>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-zinc-100 w-full text-center">
                      <p className="text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                        Gerado via CodeCraft-Bryan
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    <button 
                      onClick={handleDownload}
                      className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Baixar PNG
                    </button>
                    
                    {navigator.share && (
                      <button 
                        onClick={handleShare}
                        className="w-full sm:flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        Compartilhar
                      </button>
                    )}

                    <button 
                      onClick={handleCopyLink}
                      className="w-full sm:flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 px-6 rounded-2xl border border-zinc-700 transition-all flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          Copiar Link
                        </>
                      )}
                    </button>
                  </div>

                  <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Conteúdo Codificado</p>
                      <p className="text-sm text-zinc-300 truncate font-mono">{data}</p>
                    </div>
                    <a 
                      href={data} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-zinc-950 border border-zinc-800 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                    <QrCode className="w-10 h-10 text-zinc-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-300">Aguardando Dados</h3>
                    <p className="text-sm text-zinc-500 max-w-[240px] mx-auto mt-2">
                      Preencha as informações ao lado para visualizar seu código.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Features / Tips */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: <Download className="w-4 h-4" />, title: "Alta Qualidade", desc: "Downloads em PNG de alta resolução." },
                { icon: <Settings2 className="w-4 h-4" />, title: "Personalizável", desc: "Ajuste cores, tamanhos e formatos." },
                { icon: <CheckCircle2 className="w-4 h-4" />, title: "Profissional", desc: "Ideal para produtos e marketing." }
              ].map((feature, i) => (
                <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 space-y-2">
                  <div className="text-indigo-500">{feature.icon}</div>
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">{feature.title}</h4>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-12 mt-12 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} CodeCraft. Ferramenta gratuita para geração de códigos.
          </p>
          <div className="flex items-center justify-center gap-6">
            <button className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Privacidade</button>
            <button className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Termos</button>
            <button className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">Contato</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
