import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet, Alert } from 'react-native';
//import { reportUser, reportPost, reportComment } from '@/lib/report'; // your helpers

type ReportTarget =
  | { type: 'USER'; id: string; username: string }
  | { type: 'POST'; id: string; reporteeId: string }
  | { type: 'COMMENT'; id: string; reporteeId: string };

const reasons = ['SPAM', 'HARASSMENT', 'CHILD_SAFETY', 'INAPPROPRIATE', 'OTHER'] as const;

interface ReportButtonProps {
  target: ReportTarget;
}

const ReportButton: React.FC<ReportButtonProps> = ({ target }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // const handleReport = async (reason: typeof reasons[number]) => {
  //   try {
  //     if (target.type === 'USER') {
  //       await reportUser(target.id, reason);
  //     } else if (target.type === 'POST') {
  //       await reportPost(target.reporteeId, target.id, reason);
  //     } else if (target.type === 'COMMENT') {
  //       await reportComment(target.reporteeId, target.id, reason);
  //     }

  //     Alert.alert('Reported', 'Thank you! Our team will review this report.');
  //   } catch (err: any) {
  //     console.error(err);
  //     Alert.alert('Error', err?.response?.data?.message || 'Failed to submit report.');
  //   } finally {
  //     setModalVisible(false);
  //   }
  // };

  return (
    <View>
      <Pressable onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons color={'red'} name="shield-alert"/>
      </Pressable>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.title}>Select a reason:</Text>
            {reasons.map((reason) => (
              <Pressable
                key={reason}
                style={styles.option}
               // onPress={() => handleReport(reason)}
              >
                <Text style={styles.optionText}>{reason}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.option, { backgroundColor: '#ccc' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 14,
  },
});

export default ReportButton;
