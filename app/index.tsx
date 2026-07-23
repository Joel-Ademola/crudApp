import {
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { Todo, todos } from "../data/todos";

export default function Index() {
  const [todosList, setTodosList] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  // const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const { colorScheme, setColorScheme, theme } = useTheme();
  const router = useRouter();
  const [loaded, error] = useFonts({
    Inter_500Medium,
    Inter_700Bold,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("TodoApp");
        const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (storageTodos && storageTodos.length) {
          setTodosList(storageTodos.sort((a: any, b: any) => a.id - b.id));
        } else {
          setTodosList(todos.sort((a, b) => a.id - b.id));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const storeData = async () => {
      try {
        const jsonValue = JSON.stringify(todosList);
        await AsyncStorage.setItem("TodoApp", jsonValue);
      } catch (error) {
        console.log(error);
      }
    };
    storeData();
  }, [todosList]);

  if (!loaded) {
    return null;
  }
  if (error) {
    console.error(error);
  }

  const styles = createStyles(theme, colorScheme);
  const handleAddTodo = () => {
    if (newTodo.trim() === "") return;

    const newId =
      todosList.length > 0 ? todosList[todosList.length - 1].id + 1 : 1;
    const todo = { id: newId, title: newTodo, completed: false };
    setTodosList([...todosList, todo]);
    setNewTodo("");
  };

  const toggleTodoCompletion = (id: number) => {
    const updatedTodos = todosList.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    );
    setTodosList(updatedTodos);
  };

  const handleDelete = (id: number) => {
    const updatedTodos = todosList.filter((todo) => todo.id !== id);
    setTodosList(updatedTodos);
  };
  const handlePress = (id: number) => {
    router.push({ pathname: "/todos/[id]", params: { id: id.toString() } });
  };
  function createStyles(theme: any, ColorScheme: any) {
    return StyleSheet.create({
      container: {
        flexGrow: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 10,
      },
      todoContainer: {
        marginBottom: 16,
      },
      input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        fontFamily: "Inter_500Medium",
        color: theme.text,
      },
      addBtn: {
        backgroundColor: theme.button,
        padding: 8,
        borderRadius: 4,
      },
      todoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
      },
      todoText: {
        fontSize: 16,
        fontFamily: "Inter_500Medium",
        color: theme.text,
      },
      completedText: {
        textDecorationLine: "line-through",
        color: "#999",
      },
      deleteButtonText: {
        color: "white",
        fontSize: 14,
      },
    });
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: colorScheme === "dark" ? "black" : "#f2f2f2",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 10,
          // padding: 10,
          width: "100%",
          maxWidth: 1024,
          marginHorizontal: "auto",
          pointerEvents: "auto",
        }}
      >
        <TextInput
          placeholder="Add a new todo"
          maxLength={30}
          placeholderTextColor="#999"
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
        />
        <Pressable onPress={handleAddTodo} style={styles.addBtn}>
          <Text
            style={{
              color: colorScheme === "dark" ? "black" : "white",
              fontFamily: "Inter_500Medium",
            }}
          >
            Add
          </Text>
        </Pressable>
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

      <View style={styles.todoContainer}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Todos</Text>
      </View>
      <Animated.FlatList
        data={todosList}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        ListEmptyComponent={() => (
          <View>
            <Text style={{ color: colorScheme === "dark" ? "white" : "black" }}>
              No todos found
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Pressable
              onPress={() => handlePress(item.id)}
              onLongPress={() => toggleTodoCompletion(item.id)}
            >
              <Text
                style={[
                  styles.todoText,
                  item.completed && styles.completedText,
                ]}
              >
                {item.title}
              </Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteButtonText}>
                <MaterialCommunityIcons
                  name="delete-circle"
                  size={24}
                  color="red"
                />
              </Text>
            </Pressable>
          </View>
        )}
        itemLayoutAnimation={LinearTransition}
        keyboardDismissMode="on-drag"
      />
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </SafeAreaView>
  );
}
