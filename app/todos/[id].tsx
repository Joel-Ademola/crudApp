import { useTheme } from "@/context/ThemeContext";
import { Todo } from "@/data/todos";
import {
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditScreen() {
  const { id } = useLocalSearchParams();
  const [todo, setTodo] = useState<Todo | undefined>();
  const router = useRouter();
  const { colorScheme, setColorScheme, theme } = useTheme();
  const styles = createStyles(theme, colorScheme);

  const [loaded, error] = useFonts({
    Inter_500Medium,
    Inter_700Bold,
  });

  useEffect(() => {
    const fetchData = async (itemId: string | undefined) => {
      try {
        const jsonValue = await AsyncStorage.getItem("TodoApp");
        const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null;
        if (storageTodos && storageTodos.length && itemId) {
          const myTodo = storageTodos.find(
            (todo: Todo) => todo.id.toString() === itemId,
          );
          setTodo(myTodo);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData(id as string);
  }, [id]);

  if (!loaded) {
    return null;
  }
  if (error) {
    console.error(error);
  }

  const handleSave = async () => {
    try {
      const savedTodo = { ...todo, title: todo?.title };
      const jsonValue = await AsyncStorage.getItem("TodoApp");
      const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null;
      if (storageTodos && storageTodos.length) {
        const otherTodos = storageTodos.filter(
          (todo: Todo) => todo.id !== savedTodo.id,
        );
        const allTodos = [...otherTodos, savedTodo];
        await AsyncStorage.setItem("TodoApp", JSON.stringify(allTodos));
      } else {
        await AsyncStorage.setItem("TodoApp", JSON.stringify(savedTodo));
      }
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  function createStyles(theme: any, ColorScheme: any) {
    return StyleSheet.create({
      container: {
        flex: 1,
        width: "100%",
        backgroundColor: theme.background,
      },
      inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        gap: 6,
        width: "100%",
        maxWidth: 1024,
        marginHorizontal: "auto",
        pointerEvents: "auto",
      },
      input: {
        flex: 1,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        fontSize: 18,
        fontFamily: "Inter_500Medium",
        minWidth: 0,
        color: theme.text,
      },
      saveBtn: {
        backgroundColor: theme.button,
        borderRadius: 5,
        padding: 10,
      },
      saveBtnText: {
        fontSize: 18,
        color: colorScheme === "dark" ? "black" : "white",
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Edit todo"
          placeholderTextColor="#999"
          maxLength={30}
          style={styles.input}
          value={todo?.title || ""}
          onChangeText={(text: string) =>
            setTodo((prev) =>
              prev
                ? {
                    ...prev,
                    title: text,
                  }
                : prev,
            )
          }
        />
        <Pressable
          onPress={() =>
            setColorScheme(colorScheme === "light" ? "dark" : "light")
          }
          style={{ padding: 8 }}
        >
          <Octicons
            name={colorScheme === "dark" ? "moon" : "sun"}
            size={24}
            color={theme.text}
          />
        </Pressable>
      </View>
      <View style={styles.inputContainer}>
        <Pressable onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router.push("/");
          }}
          style={[styles.saveBtn, { backgroundColor: "red" }]}
        >
          <Text style={[styles.saveBtnText, { color: "white" }]}>Cancel</Text>
        </Pressable>
      </View>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </SafeAreaView>
  );
}
