import React, { useEffect, useState } from 'react';
import { contactAPI } from '../../services/api';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Mail, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ContactMessages = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await contactAPI.getAll();
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyClick = (contact) => {
    setSelectedContact(contact);
    setReplyText(contact.reply || '');
    setReplyDialogOpen(true);
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      await contactAPI.reply(selectedContact._id || selectedContact.id, replyText);
      toast.success('Reply sent successfully!');
      setReplyDialogOpen(false);
      setReplyText('');
      fetchContacts();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply.');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8" data-testid="contact-messages-header">
        <h1 className="text-3xl font-bold text-stone-900">Contact Messages</h1>
        <p className="text-stone-600">Respond to customer inquiries</p>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center text-stone-600">Loading messages...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16" data-testid="no-messages">
          <p className="text-xl text-stone-600">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-4" data-testid="messages-list">
          {contacts.map((contact) => (
            <Card
              key={contact._id || contact.id}
              className="p-6 border border-stone-200"
              data-testid={`contact-item-${contact._id || contact.id}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold" data-testid="contact-name">
                      {contact.name}
                    </h3>
                    <Badge
                      className={
                        contact.status === 'replied'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      }
                      data-testid="contact-status"
                    >
                      {contact.status === 'replied' ? 'Replied' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600 mb-3">
                    <Mail className="w-4 h-4" />
                    <span data-testid="contact-email">{contact.email}</span>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg mb-3">
                    <p className="text-stone-700" data-testid="contact-message">{contact.message}</p>
                  </div>
                  {contact.reply && (
                    <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-2 text-sm text-teal-700 mb-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-semibold">Your Reply:</span>
                      </div>
                      <p className="text-stone-700" data-testid="contact-reply">{contact.reply}</p>
                    </div>
                  )}
                  <div className="text-xs text-stone-500 mt-2">
                    Received: {format(new Date(contact.created_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                <div>
                  <Button
                    onClick={() => handleReplyClick(contact)}
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                    data-testid="contact-reply-btn"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {contact.reply ? 'Edit Reply' : 'Reply'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent data-testid="reply-dialog">
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-stone-600 mb-2">Original Message:</p>
              <div className="bg-stone-50 p-4 rounded-lg">
                <p className="text-stone-700">{selectedContact?.message}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-stone-600 mb-2">Your Reply:</p>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply here..."
                className="min-h-32 resize-none"
                data-testid="reply-textarea"
              />
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleReplySubmit}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="reply-submit-btn"
              >
                Send Reply
              </Button>
              <Button
                variant="outline"
                onClick={() => setReplyDialogOpen(false)}
                data-testid="reply-cancel-btn"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessages;
