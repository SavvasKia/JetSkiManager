import React, { useEffect, useState } from "react";
import FleetStatusCards from "@/components/fleet/FleetStatusCards";
import FleetTable from "@/components/fleet/FleetTable";
import MaintenanceTable from "@/components/fleet/MaintenanceTable";
import BlockTimeForm from "@/components/fleet/BlockTimeForm";
import JetSkiForm from "@/components/fleet/JetSkiForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Fleet: React.FC = () => {
  const [showBlockTimeForm, setShowBlockTimeForm] = useState(false);
  const [showJetSkiForm, setShowJetSkiForm] = useState(false);

  useEffect(() => {
    document.title = "Fleet Management | JetSki Manager";
  }, []);

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Fleet Management</h1>
          <div className="mt-3 md:mt-0">
            <Button 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setShowJetSkiForm(true)}
            >
              <i className="ri-add-line mr-2"></i> Add New JetSki
            </Button>
          </div>
        </div>

        {/* Fleet Overview Cards */}
        <FleetStatusCards />

        {/* Fleet Table */}
        <div className="mt-6">
          <FleetTable />
        </div>

        {/* Maintenance Schedule */}
        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Maintenance Schedule</h2>
        <MaintenanceTable />

        {/* Block Time Form */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Block Time for Maintenance or Refueling</h2>
          <Button 
            variant="outline"
            onClick={() => setShowBlockTimeForm(!showBlockTimeForm)}
          >
            {showBlockTimeForm ? "Hide Form" : "Schedule Downtime"}
          </Button>
        </div>

        {showBlockTimeForm && <BlockTimeForm onSuccess={() => setShowBlockTimeForm(false)} />}
      </div>

      {/* JetSki Form Dialog */}
      <Dialog open={showJetSkiForm} onOpenChange={setShowJetSkiForm}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New JetSki</DialogTitle>
          </DialogHeader>
          <JetSkiForm 
            onSuccess={() => setShowJetSkiForm(false)} 
            onCancel={() => setShowJetSkiForm(false)} 
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Fleet;
