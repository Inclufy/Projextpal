import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Download, Share2, CheckCircle2, Printer, Linkedin, ExternalLink } from "lucide-react";

interface CertificateProps {
  courseId: string;
  courseTitle: string;
  studentName: string;
  apiBase: string;
  language: string;
  progress: number;
}

export default function CertificateViewer({ 
  courseId, 
  courseTitle, 
  studentName, 
  apiBase, 
  language, 
  progress 
}: CertificateProps) {
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false); // ADDED
  const [error, setError] = useState<string | null>(null);

  const isNL = language === "nl";
  const isCompleted = progress >= 100;

  const generateCert = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${apiBase}/academy/certificate/${courseId}/generate/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setCertificate(await res.json());
      } else {
        // Fallback: show local certificate
        setCertificate({
          certificate_number: `PXP-${Date.now().toString(36).toUpperCase()}`,
          course_title: courseTitle,
          student_name: studentName,
          issued_at: new Date().toISOString(),
          course_duration: 0,
        });
      }
    } catch {
      setCertificate({
        certificate_number: `PXP-${Date.now().toString(36).toUpperCase()}`,
        course_title: courseTitle,
        student_name: studentName,
        issued_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // ADDED: Download PDF function
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${apiBase}/academy/certificate/${courseId}/pdf/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        // If backend provides PDF endpoint
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ProjeXtPal_Certificate_${certificate.certificate_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Fallback: Client-side PDF generation using html2canvas + jsPDF
        // NOTE: This requires installing: npm install html2canvas jspdf
        const { default: html2canvas } = await import('html2canvas');
        const { default: jsPDF } = await import('jspdf');
        
        const certElement = document.getElementById('certificate-content');
        if (!certElement) {
          console.error('Certificate element not found');
          return;
        }
        
        const canvas = await html2canvas(certElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`ProjeXtPal_Certificate_${certificate.certificate_number}.pdf`);
      }
    } catch (error) {
      console.error('PDF download error:', error);
      setError(isNL ? 'Kon PDF niet downloaden' : 'Could not download PDF');
    } finally {
      setDownloading(false);
    }
  };

  // ADDED: Print certificate
  const handlePrint = () => {
    window.print();
  };

  // ADDED: Share to LinkedIn
  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.course_title)}&organizationId=&issueYear=${new Date(certificate.issued_at).getFullYear()}&issueMonth=${new Date(certificate.issued_at).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${certificate.certificate_number}`;
    window.open(linkedInUrl, '_blank');
  };

  // ADDED: Copy certificate link
  const handleCopyLink = () => {
    const certLink = `${window.location.origin}/certificate/${certificate.certificate_number}`;
    navigator.clipboard.writeText(certLink);
    // Optional: Show toast notification
  };

  if (certificate) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Certificate Display */}
        <Card 
          id="certificate-content"
          className="border-4 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 shadow-2xl"
        >
          <CardContent className="pt-12 pb-8">
            {/* Logo/Branding Area */}
            <div className="text-center mb-8">
              <div className="inline-block">
                <Award className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
              </div>
              <Badge className="bg-yellow-500 text-white mb-4 text-base px-4 py-1">
                {isNL ? "Certificaat van Voltooiing" : "Certificate of Completion"}
              </Badge>
            </div>

            {/* Content */}
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <p className="text-muted-foreground text-lg">
                {isNL ? "Dit certificeert dat" : "This certifies that"}
              </p>
              
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {certificate.student_name}
              </h2>
              
              <p className="text-muted-foreground text-lg">
                {isNL ? "succesvol heeft afgerond" : "has successfully completed"}
              </p>
              
              <h3 className="text-2xl font-bold text-foreground px-8">
                {certificate.course_title}
              </h3>

              {certificate.course_duration && (
                <p className="text-sm text-muted-foreground">
                  {isNL ? "Cursusduur:" : "Course duration:"} {certificate.course_duration} {isNL ? "uur" : "hours"}
                </p>
              )}
            </div>

            {/* Footer with Verification */}
            <div className="mt-12 pt-8 border-t-2 border-yellow-300 flex items-center justify-between text-sm">
              <div className="text-left">
                <p className="font-semibold text-foreground">ProjeXtPal Academy</p>
                <p className="text-muted-foreground text-xs">
                  {new Date(certificate.issued_at).toLocaleDateString(isNL ? 'nl-NL' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {isNL ? "Certificaat nr." : "Certificate no."}
                </p>
                <p className="font-mono font-semibold text-foreground">
                  {certificate.certificate_number}
                </p>
              </div>
            </div>

            {/* Verification QR code placeholder */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                {isNL 
                  ? "Verifieer dit certificaat op: projextpal.com/verify/" + certificate.certificate_number
                  : "Verify this certificate at: projextpal.com/verify/" + certificate.certificate_number
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons - ENHANCED */}
        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button 
              variant="default" 
              size="lg" 
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? (isNL ? "Downloaden..." : "Downloading...") : "PDF"}
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              onClick={handlePrint}
              className="w-full"
            >
              <Printer className="w-4 h-4 mr-2" />
              {isNL ? "Afdrukken" : "Print"}
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleLinkedInShare}
              className="w-full border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5]/10"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleCopyLink}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {isNL ? "Delen" : "Share"}
            </Button>
          </div>

          {/* Additional Info */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-1">
                    {isNL ? "Wat nu?" : "What's next?"}
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• {isNL ? "Voeg je certificaat toe aan LinkedIn" : "Add your certificate to LinkedIn"}</li>
                    <li>• {isNL ? "Deel je prestatie met je netwerk" : "Share your achievement with your network"}</li>
                    <li>• {isNL ? "Ontdek vervolgcursussen" : "Explore advanced courses"}</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Pre-certificate view (when course not yet completed)
  return (
    <div className="max-w-md mx-auto py-8 text-center px-4">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
        isCompleted 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-yellow-500/20' 
          : 'bg-muted'
      }`}>
        <Award className={`w-10 h-10 ${isCompleted ? 'text-white' : 'text-muted-foreground'}`} />
      </div>
      
      <h3 className="text-xl font-bold mb-3">
        {isNL ? "Certificaat" : "Certificate"}
      </h3>
      
      {isCompleted ? (
        <>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {isNL 
              ? "🎉 Gefeliciteerd! Je hebt alle lessen voltooid. Genereer nu je professionele certificaat."
              : "🎉 Congratulations! You completed all lessons. Generate your professional certificate now."}
          </p>
          <Button 
            onClick={generateCert} 
            disabled={loading} 
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg"
          >
            {loading 
              ? (isNL ? "Genereren..." : "Generating...") 
              : (isNL ? "🏆 Certificaat Genereren" : "🏆 Generate Certificate")}
          </Button>
        </>
      ) : (
        <>
          <p className="text-muted-foreground mb-4">
            {isNL 
              ? `Rond alle lessen af om je certificaat te ontvangen. Je bent al ${progress}% klaar!`
              : `Complete all lessons to receive your certificate. You're ${progress}% done!`}
          </p>
          
          {/* Progress Circle */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                fill="none" 
                strokeWidth="8" 
                className="stroke-muted" 
              />
              <circle 
                cx="60" 
                cy="60" 
                r="50" 
                fill="none" 
                strokeWidth="8"
                strokeDasharray={`${progress * 3.14} ${314 - progress * 3.14}`}
                strokeLinecap="round"
                className="stroke-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{progress}%</span>
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                {isNL ? "Blijf leren om je certificaat te verdienen!" : "Keep learning to earn your certificate!"}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// OPTIONAL: Add print styles to hide buttons when printing
// Add this to your global CSS:
/*
@media print {
  .no-print,
  button,
  nav,
  footer {
    display: none !important;
  }
  
  #certificate-content {
    border: none !important;
    box-shadow: none !important;
  }
}
*/