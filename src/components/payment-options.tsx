import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Coffee, Heart } from 'lucide-react';

const PaymentOptions = ({ onPaymentSelect }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  
  // These would come from environment variables in production
  const STRIPE_LINK = "YOUR_STRIPE_PAYMENT_LINK";
  const KOFI_USERNAME = "YOUR_KOFI_USERNAME";
  const BMC_USERNAME = "YOUR_BMC_USERNAME";

  const renderStripeButton = () => (
    <Button 
      className="w-full justify-between"
      onClick={() => window.location.href = STRIPE_LINK}
    >
      <span>Pay with Card</span>
      <CreditCard className="ml-2" />
    </Button>
  );

  const renderKofiButton = () => (
    <div className="w-full">
      <iframe 
        id='kofiframe'
        src={`https://ko-fi.com/${KOFI_USERNAME}/?hidefeed=true&widget=true&embed=true&preview=true`}
        style={{border:'none',width:'100%',padding:'4px',background:'#f9fafb'}}
        height="712"
        title="ko-fi donations"
      />
    </div>
  );

  const renderBMCButton = () => (
    <div className="w-full">
      <script 
        data-name="BMC-Widget" 
        data-cfasync="false" 
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" 
        data-id={BMC_USERNAME} 
        data-description="Support me on Buy me a coffee!" 
        data-message="" 
        data-color="#40DCA5" 
        data-position="right" 
        data-x_margin="18" 
        data-y_margin="18"
      />
    </div>
  );

  const PaymentMethodCard = ({ title, description, icon: Icon, method }) => (
    <Card 
      className={`p-4 cursor-pointer transition-all ${
        selectedOption === method ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
      }`}
      onClick={() => setSelectedOption(method)}
    >
      <div className="flex items-center gap-3">
        <Icon className={selectedOption === method ? 'text-blue-500' : 'text-gray-500'} />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 mb-6">
        <PaymentMethodCard
          title="Credit Card"
          description="Quick and secure payment via Stripe"
          icon={CreditCard}
          method="stripe"
        />
        <PaymentMethodCard
          title="Ko-fi"
          description="Support through Ko-fi platform"
          icon={Coffee}
          method="kofi"
        />
        <PaymentMethodCard
          title="Buy Me A Coffee"
          description="Quick support via BMC"
          icon={Heart}
          method="bmc"
        />
      </div>

      <div className="mt-4">
        {selectedOption === 'stripe' && renderStripeButton()}
        {selectedOption === 'kofi' && renderKofiButton()}
        {selectedOption === 'bmc' && renderBMCButton()}
      </div>

      <p className="text-xs text-center text-gray-500 mt-4">
        All payments are processed securely through trusted third-party providers.
        Your payment information is never stored on our servers.
      </p>
    </div>
  );
};

export default PaymentOptions;