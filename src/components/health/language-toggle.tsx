import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages, Globe } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  rtl?: boolean
}

const LanguageToggle = () => {
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const { toast } = useToast()

  const languages: Language[] = [
    { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
    { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
    { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", rtl: true },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
    { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇹🇿" },
    { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
    { code: "yo", name: "Yoruba", nativeName: "Yorùbá", flag: "🇳🇬" }
  ]

  const handleLanguageChange = (languageCode: string) => {
    const language = languages.find(lang => lang.code === languageCode)
    if (!language) return

    setCurrentLanguage(languageCode)
    
    // Apply RTL direction if needed
    if (language.rtl) {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }

    // Store preference in localStorage
    localStorage.setItem('healthtrack-language', languageCode)

    toast({
      title: `Language Changed`,
      description: `Interface language set to ${language.name} (${language.nativeName})`,
      variant: "default"
    })

    // In a real app, you would trigger i18n translation here
    console.log(`Language changed to: ${language.name}`)
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  // Sample translations for demo purposes
  const translations: Record<string, Record<string, string>> = {
    en: {
      selectLanguage: "Select Language",
      healthForEveryone: "Healthcare for Everyone",
      currentlySelected: "Currently selected"
    },
    es: {
      selectLanguage: "Seleccionar idioma",
      healthForEveryone: "Salud para todos",
      currentlySelected: "Actualmente seleccionado"
    },
    fr: {
      selectLanguage: "Sélectionner la langue",
      healthForEveryone: "Santé pour tous",
      currentlySelected: "Actuellement sélectionné"
    },
    ar: {
      selectLanguage: "اختر اللغة",
      healthForEveryone: "الرعاية الصحية للجميع",
      currentlySelected: "المحدد حاليا"
    },
    zh: {
      selectLanguage: "选择语言",
      healthForEveryone: "人人享有医疗保健",
      currentlySelected: "当前选择"
    },
    hi: {
      selectLanguage: "भाषा चुनें",
      healthForEveryone: "सभी के लिए स्वास्थ्य सेवा",
      currentlySelected: "वर्तमान में चयनित"
    },
    sw: {
      selectLanguage: "Chagua Lugha",
      healthForEveryone: "Afya kwa Kila Mtu",
      currentlySelected: "Kwa sasa umechagua"
    }
  }

  const t = (key: string) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{currentLang.flag}</span>
            <span className="hidden md:inline">{currentLang.nativeName}</span>
            <Languages className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-2 text-sm font-medium text-muted-foreground border-b">
            {t("selectLanguage")}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center gap-3 p-3 cursor-pointer ${
                  currentLanguage === language.code ? 'bg-muted' : ''
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.name}</div>
                  <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                </div>
                {currentLanguage === language.code && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </DropdownMenuItem>
            ))}
          </div>
          <div className="p-2 text-xs text-muted-foreground border-t">
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {t("healthForEveryone")}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default LanguageToggle