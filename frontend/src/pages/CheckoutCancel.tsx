import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, ArrowLeft, MessageSquare } from 'lucide-react';

const CheckoutCancel = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="h-20 w-20 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Betaling Geannuleerd</h1>
            <p className="text-muted-foreground mt-2">
              Je betaling is niet voltooid. Geen zorgen, er is niets in rekening gebracht.
            </p>
          </div>
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => navigate('/landing#pricing')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar Prijzen
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/contact')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Hulp Nodig?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutCancel;
