
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface ApiKeyDialogProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ apiKey, onApiKeyChange }) => {
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onApiKeyChange(inputApiKey);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perplexity API Key</DialogTitle>
          <DialogDescription>
            Enter your Perplexity API key to use the chat functionality.
            Your API key is stored locally and never sent to our servers.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              placeholder="pplx-..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            className="bg-primary hover:bg-primary/80"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
