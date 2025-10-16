// App.js
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Plus, Trash2, ArrowLeft } from "lucide-react-native";
import InvoicePDF from "./InvoicePDF"; // Ensure this works on React Native

export default function InvoiceForm() {
  const [formData, setFormData] = useState({
    invoiceNo: "1",
    billDate: new Date().toISOString().split("T")[0],
    partyName: "SAHIL ROADWAYS",
    partyAddress: "KALAMBOLI",
    from: "IMPEX",
    to: "BHILAD",
    backTo: "PANINDIA",
    loadingDate: "2024-08-16",
    unloadingDate: "2024-08-18",
    commission: "0.00",
  });

  const [vehicles, setVehicles] = useState([
    {
      lrNo: "10886",
      vehicleNo: "MH 43 Y 7655",
      containerNo: "BMOU-6382983",
      freight: "28000",
      unloadingCharges: "4602",
      detention: "0",
      weightCharges: "0",
      others: "0",
      commission: "500",
      totalFreight: "33102.00",
      advance: "26000",
      balance: "7102.00",
    },
  ]);

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const totalCommission = vehicles.reduce((sum, v) => sum + parseFloat(v.commission || 0), 0);
    setFormData(prev => ({ ...prev, commission: totalCommission.toFixed(2).toString() }));
  }, [vehicles]);

  const handleFormChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVehicleChange = (index, field, value) => {
    const updated = [...vehicles];
    updated[index][field] = value;

    const calculationFields = ['freight', 'unloadingCharges', 'detention', 'weightCharges', 'others', 'commission', 'advance'];

    if (calculationFields.includes(field)) {
      const v = updated[index];
      const total = parseFloat(v.freight || 0) + parseFloat(v.unloadingCharges || 0) +
                    parseFloat(v.detention || 0) + parseFloat(v.weightCharges || 0) +
                    parseFloat(v.others || 0) + parseFloat(v.commission || 0);

      updated[index].totalFreight = total.toFixed(2).toString();
      updated[index].balance = (total - parseFloat(v.advance || 0)).toFixed(2).toString();
    }

    setVehicles(updated);
  };

  const addVehicle = () => {
    const lastVehicle = vehicles[vehicles.length - 1];
    if (lastVehicle) {
      const newVehicle = { ...lastVehicle, lrNo: "", vehicleNo: "", containerNo: "" };
      setVehicles([...vehicles, newVehicle]);
    } else {
      setVehicles([...vehicles, {
        lrNo: "", vehicleNo: "", containerNo: "",
        freight: "0.00", unloadingCharges: "0.00", detention: "0.00",
        weightCharges: "0.00", others: "0.00", commission: "0.00",
        totalFreight: "0.00", advance: "0.00", balance: "0.00",
      }]);
    }
  };

  const removeVehicle = (index) => {
    if (vehicles.length > 1) setVehicles(vehicles.filter((_, i) => i !== index));
  };

  const totalBalance = vehicles.reduce((sum, v) => sum + parseFloat(v.balance || 0), 0).toFixed(2);
  const totalAdvance = vehicles.reduce((sum, v) => sum + parseFloat(v.advance || 0), 0).toFixed(2);
  const totalFreight = vehicles.reduce((sum, v) => sum + parseFloat(v.totalFreight || 0), 0).toFixed(2);

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      {!showPreview ? (
        <View className="bg-white shadow-xl rounded-2xl p-6">
          <Text className="text-3xl font-extrabold text-center text-blue-900 mb-6">New Invoice</Text>

          {/* Bill & Trip Info */}
          <View className="bg-blue-50 p-4 rounded-lg mb-6 shadow-md">
            <Text className="text-xl font-semibold text-blue-900 mb-4">Bill & Global Trip Information</Text>

            {['invoiceNo', 'billDate', 'partyName'].map(name => (
              <View key={name} className="mb-4">
                <Text className="text-gray-700">{name}</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={formData[name]}
                  onChangeText={text => handleFormChange(name, text)}
                />
              </View>
            ))}

            {['loadingDate', 'unloadingDate', 'from', 'to', 'backTo'].map(name => (
              <View key={name} className="mb-4">
                <Text className="text-gray-700">{name}</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  value={formData[name]}
                  onChangeText={text => handleFormChange(name, text)}
                />
              </View>
            ))}

            <View className="mb-4">
              <Text className="text-gray-700">Party Address</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={formData.partyAddress}
                onChangeText={text => handleFormChange('partyAddress', text)}
              />
            </View>
          </View>

          {/* Vehicles */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-gray-800">Vehicle Details ({vehicles.length})</Text>
              <TouchableOpacity className="flex-row items-center bg-green-600 px-4 py-2 rounded-xl" onPress={addVehicle}>
                <Plus size={18} color="#fff" />
                <Text className="text-white ml-2">Add Vehicle</Text>
              </TouchableOpacity>
            </View>

            {vehicles.map((v, i) => (
              <View key={i} className="bg-white p-4 rounded-xl mb-4 shadow border-l-4 border-blue-500">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold text-blue-700">Vehicle #{i + 1}</Text>
                  {vehicles.length > 1 && (
                    <TouchableOpacity className="flex-row items-center" onPress={() => removeVehicle(i)}>
                      <Trash2 size={18} color="red" />
                      <Text className="text-red-600 ml-1">Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {['lrNo', 'vehicleNo', 'containerNo'].map(f => (
                  <View key={f} className="mb-2">
                    <Text className="text-gray-700">{f}</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      value={v[f]}
                      onChangeText={text => handleVehicleChange(i, f, text)}
                    />
                  </View>
                ))}

                {['freight', 'unloadingCharges', 'detention', 'weightCharges', 'others', 'commission', 'advance'].map(f => (
                  <View key={f} className="mb-2">
                    <Text className="text-gray-700">{f}</Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2"
                      keyboardType="numeric"
                      value={v[f]}
                      onChangeText={text => handleVehicleChange(i, f, text)}
                    />
                  </View>
                ))}

                <View className="mb-2">
                  <Text className="text-gray-700">Total Freight</Text>
                  <TextInput className="border border-gray-300 rounded-lg px-3 py-2 bg-blue-100 text-blue-900 font-semibold" value={v.totalFreight} editable={false} />
                </View>
                <View className="mb-2">
                  <Text className="text-gray-700">Balance</Text>
                  <TextInput className="border border-gray-300 rounded-lg px-3 py-2 bg-green-100 text-green-800 font-bold" value={v.balance} editable={false} />
                </View>
              </View>
            ))}
          </View>

          {/* Summary */}
          <View className="bg-gray-100 p-4 rounded-xl mb-6">
            <Text className="text-xl font-extrabold mb-2">Invoice Totals Summary</Text>
            <Text>Total Freight: ₹{totalFreight}</Text>
            <Text>Total Commission: ₹{formData.commission}</Text>
            <Text>Total Advance: ₹{totalAdvance}</Text>
            <Text>Total Balance: ₹{totalBalance}</Text>
          </View>

          <TouchableOpacity className="bg-blue-600 py-3 rounded-xl items-center" onPress={() => setShowPreview(true)}>
            <Text className="text-white font-bold text-lg">Generate Invoice PDF</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-2xl font-bold">Invoice Preview</Text>
            <TouchableOpacity className="flex-row items-center bg-gray-600 px-4 py-2 rounded-xl" onPress={() => setShowPreview(false)}>
              <ArrowLeft size={18} color="#fff" />
              <Text className="text-white ml-2">Back to Form</Text>
            </TouchableOpacity>
          </View>
          <InvoicePDF formData={formData} vehicles={vehicles} />
        </View>
      )}
    </ScrollView>
  );
}
