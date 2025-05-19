import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.item}>
      <TouchableOpacity style={styles.questionRow} onPress={() => setExpanded(!expanded)}>
        <View style={styles.icon}>
        <Feather name={expanded ? 'minus' : 'plus'} size={18} color="#000" />
        </View>
        <Text style={styles.question}>{question}</Text>
       
      </TouchableOpacity>
      {expanded && <Text style={styles.answer}>{answer}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    borderBottomWidth:0.5,
     borderColor:'#ccc'
  },
  questionRow: {
    flexDirection: 'row',
  
    alignItems: 'center',
    gap:26
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
  },
  answer: {
    marginTop: 10,
    color: '#4a5568',
    paddingHorizontal:50
  },
  icon:{
width:28,
height:28,
display:'flex',
justifyContent:'center',
alignItems:'center',
backgroundColor:'#f8f8fe',
borderRadius:'50%'
  }
});

export default FAQItem;
