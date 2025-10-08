const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); 

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  message.textContent = "Logging in...";

  try {
    const response = await fetch("https://dummyjson.com/users");
    if (!response.ok) {
      throw new Error("Gagal mengambil data user dari API");
    }

    const data = await response.json();
    const users = data.users;

    const foundUser = users.find((user) => user.username === username);

    if (!foundUser) {
      message.textContent = "Username tidak ditemukan!";
      return;
    }

    if (password === "") {
      message.textContent = "Password tidak boleh kosong!";
      return;
    }

    if (foundUser.password !== password) {
      message.textContent = "Password salah!";
      return;
    }

    localStorage.setItem("firstName", foundUser.firstName);
    message.textContent = "Login berhasil! Mengarahkan ke halaman resep...";

    setTimeout(() => {
      window.location.href = "home.html";
    }, 1500);

  } catch (error) {
    console.error(error);
    message.textContent = "Terjadi kesalahan koneksi API!";
  }
});
