import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronRight,
  Book,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  AlertTriangle,
  Zap,
  Settings,
  BarChart3
} from 'lucide-react';
import Button from '../common/Button';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "How do I connect a new device to the GUARD system?",
      answer: "To connect a new device: 1) Go to the Dashboard, 2) Click on 'Add Device' in the Energy Management section, 3) Follow the setup wizard to configure your device parameters, 4) Test the connection to ensure proper data transmission.",
      category: "setup"
    },
    {
      id: 2,
      question: "What do the different severity levels mean in anomaly detection?",
      answer: "GUARD uses four severity levels: LOW (minor fluctuations within acceptable range), MEDIUM (notable deviations requiring attention), HIGH (significant anomalies that may affect performance), and CRITICAL (immediate action required to prevent system damage).",
      category: "anomalies"
    },
    {
      id: 3,
      question: "How can I export my energy usage data?",
      answer: "You can export data from multiple locations: 1) Dashboard - use the Export Report button, 2) Anomaly Log - click the Export button to download filtered results, 3) Settings - schedule automatic reports via email.",
      category: "data"
    },
    {
      id: 4,
      question: "Why am I receiving false anomaly alerts?",
      answer: "False alerts can occur due to: 1) Incorrect threshold settings, 2) Seasonal usage variations, 3) New equipment installation. Adjust your alert thresholds in Settings > Alerts, or contact support for calibration assistance.",
      category: "anomalies"
    },
    {
      id: 5,
      question: "How do I set up email notifications for power threshold warnings?",
      answer: "Navigate to Settings > Notifications. Enable 'Power Threshold Alerts', set your desired threshold values, and ensure your email address is verified. You can test notifications using the 'Send Test Email' button.",
      category: "notifications"
    },
    {
      id: 6,
      question: "What should I do if my device shows as offline?",
      answer: "If a device appears offline: 1) Check physical connections and power supply, 2) Verify network connectivity, 3) Restart the device if necessary, 4) Review device logs in the troubleshooting section, 5) Contact support if issues persist.",
      category: "troubleshooting"
    },
    {
      id: 7,
      question: "How accurate is the anomaly detection system?",
      answer: "GUARD's anomaly detection uses advanced machine learning algorithms with 97%+ accuracy. The system continuously learns from your usage patterns to reduce false positives and improve detection precision over time.",
      category: "system"
    },
    {
      id: 8,
      question: "Can I customize the dashboard layout?",
      answer: "Currently, the dashboard layout is optimized for the best user experience. However, you can filter data by date ranges, device types, and severity levels. Custom dashboard layouts are planned for future releases.",
      category: "interface"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: Book },
    { id: 'setup', name: 'Setup & Installation', icon: Settings },
    { id: 'anomalies', name: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'notifications', name: 'Notifications', icon: Mail },
    { id: 'data', name: 'Data & Reports', icon: BarChart3 },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: HelpCircle },
    { id: 'system', name: 'System Information', icon: Zap },
    { id: 'interface', name: 'User Interface', icon: MessageCircle }
  ];

  const quickActions = [
    {
      title: "Device Setup Guide",
      description: "Step-by-step guide to connect your first device",
      icon: Settings,
      action: () => {}
    },
    {
      title: "Understanding Anomalies",
      description: "Learn about different types of power anomalies",
      icon: AlertTriangle,
      action: () => {}
    },
    {
      title: "Energy Optimization Tips",
      description: "Best practices for reducing energy consumption",
      icon: Zap,
      action: () => {}
    },
    {
      title: "System Status Check",
      description: "Verify your system is running optimally",
      icon: BarChart3,
      action: () => {}
    }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Help Center</h1>
            <p className="text-gray-500 mt-1">Find answers, guides, and support resources</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <action.icon className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg p-4 shadow-sm border mt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Need More Help?</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {}}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {}}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {}}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Support
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                <p className="mb-1">Support Hours:</p>
                <p>Mon-Fri: 9AM-6PM</p>
                <p>Response time: ~2 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h2>
              <div className="text-sm text-gray-500">
                {filteredFAQs.length} questions found
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>

                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="text-gray-400">Was this helpful?</span>
                          <button className="text-blue-600 hover:text-blue-700">Yes</button>
                          <button className="text-blue-600 hover:text-blue-700">No</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search terms or browse by category
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Additional Resources */}
          <div className="bg-white rounded-lg p-6 shadow-sm border mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="#"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Book className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">User Manual</h4>
                  <p className="text-sm text-gray-500">Complete guide</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </a>

              <a
                href="#"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Community Forum</h4>
                  <p className="text-sm text-gray-500">Ask questions</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </a>

              <a
                href="#"
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Zap className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">API Documentation</h4>
                  <p className="text-sm text-gray-500">For developers</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;