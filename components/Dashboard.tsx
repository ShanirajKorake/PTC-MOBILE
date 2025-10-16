import React from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Component that handles the main dashboard layout and data visualization
export const Dashboard = () => {
  const { colors } = useTheme();

  const stats = [
    { title: 'Total Sales', value: '₹ 1,25,000', icon: 'wallet-outline', colorClass: 'text-emerald-500' },
    { title: 'Pending Invoices', value: '12', icon: 'document-text-outline', colorClass: 'text-amber-500' },
    { title: 'Active Drivers', value: '25', icon: 'people-outline', colorClass: 'text-blue-500' },
  ];

  const QuickActionCard = ({ title, icon, onPress, colorClass }) => (
    <TouchableOpacity
      className={`flex-1 items-center justify-center p-5 m-1 rounded-2xl shadow-lg ${colorClass}`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={28} color="white" />
      <Text className="mt-2 text-base font-semibold text-white">{title}</Text>
    </TouchableOpacity>
  );

//   const StatCard = ({ title, value, icon, colorClass }) => (
//     <View
//       className="w-[48%] p-2  rounded-xl shadow-md border border-gray-200 
//                    bg-white dark:bg-gray-700 dark:border-gray-600"
//     >
//       <View className="flex-row items-center mb-1">
//         <Ionicons name={icon} size={20} className={colorClass} /> 
//         <Text className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">{title}</Text>
//       </View>
//       <Text className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{value}</Text>
//     </View>
//   );

  return (
    <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ margin:20, shadowColor: colors.border }}
    >
      
      {/* --- 1. Logo (Fixed 1:1 Aspect Ratio) --- */}
      <View className="bg-white rounded-2xl w-full items-center shadow-md">
        {/* Using 'w-24 h-24' (96x96 pixels) to create a centered, square logo container.
          The 'object-contain' ensures the 1:1 logo fits perfectly.
        */}
        <Image
          source={require('../assets/logo.png')} 
          className="w-64 h-64" // Fixed 1:1 dimensions
          accessibilityLabel="Company Logo"
        />
      </View>

      {/* --- 2. Quick Actions --- */}
      <Text className=" text-lg font-semibold pl-2 mt-2" style={{color:colors.text}}>Quick Actions</Text>
      <View className="flex-row justify-between  ">
        <QuickActionCard
          title="New Invoice"
          icon="add-circle"
          onPress={() => console.log('Go to New Invoice')}
          colorClass="bg-emerald-600"
        />
        <QuickActionCard
          title="View History"
          icon="receipt"
          onPress={() => console.log('Go to History')}
          colorClass="bg-indigo-600"
        />
      </View>

      {/* --- 3. Statistics Grid --- */}
      
      <View className=" width-full items-center justify-center rounded-2xl bg-white mt-4 p-4 shadow-md h-[330px] m-1">
            <Text className='text-gray-300' style={{fontWeight:700}}>More Fetures are in devlopment...</Text>
      </View>

      {/* --- 4. Recent Activity (Placeholder) ---
      <Text className="mb-3 mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200 px-4">Recent Activity</Text>
      <View className="min-h-[100px] items-center justify-center rounded-xl p-4 shadow-md bg-white dark:bg-gray-700 mx-4">
        <Text className="text-gray-500 dark:text-gray-400">No new activities reported.</Text>
      </View> */}

      <View className="h-20" />
    </ScrollView>
  );
};

export default Dashboard;