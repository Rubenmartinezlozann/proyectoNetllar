<?php

namespace App\Entity;

use App\Repository\CityRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=CityRepository::class)
 */
class City
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="bigint", nullable=true)
     */
    private $GESCAL17;

    /**
     * @ORM\Column(type="smallint", nullable=true)
     */
    private $UUII;

    /**
     * @ORM\Column(type="string", length=27)
     */
    private $PRODUCTO;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $DESCRIPCION;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $PROVINCIA;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $MUNICIPIO;

    /**
     * @ORM\Column(type="integer")
     */
    private $CP;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $TIPOVIA;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $CALLE;

    /**
     * @ORM\Column(type="smallint", nullable=true)
     */
    private $NUMERO;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $PPAI_CERRADO;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $SOLAPE;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getGESCAL17(): ?string
    {
        return $this->GESCAL17;
    }

    public function setGESCAL17(?string $GESCAL17): self
    {
        $this->GESCAL17 = $GESCAL17;

        return $this;
    }

    public function getUUII(): ?int
    {
        return $this->UUII;
    }

    public function setUUII(?int $UUII): self
    {
        $this->UUII = $UUII;

        return $this;
    }

    public function getPRODUCTO(): ?string
    {
        return $this->PRODUCTO;
    }

    public function setPRODUCTO(string $PRODUCTO): self
    {
        $this->PRODUCTO = $PRODUCTO;

        return $this;
    }

    public function getDESCRIPCION(): ?string
    {
        return $this->DESCRIPCION;
    }

    public function setDESCRIPCION(?string $DESCRIPCION): self
    {
        $this->DESCRIPCION = $DESCRIPCION;

        return $this;
    }

    public function getPROVINCIA(): ?string
    {
        return $this->PROVINCIA;
    }

    public function setPROVINCIA(?string $PROVINCIA): self
    {
        $this->PROVINCIA = $PROVINCIA;

        return $this;
    }

    public function getMUNICIPIO(): ?string
    {
        return $this->MUNICIPIO;
    }

    public function setMUNICIPIO(?string $MUNICIPIO): self
    {
        $this->MUNICIPIO = $MUNICIPIO;

        return $this;
    }

    public function getCP(): ?int
    {
        return $this->CP;
    }

    public function setCP(int $CP): self
    {
        $this->CP = $CP;

        return $this;
    }

    public function getTIPOVIA(): ?string
    {
        return $this->TIPOVIA;
    }

    public function setTIPOVIA(?string $TIPOVIA): self
    {
        $this->TIPOVIA = $TIPOVIA;

        return $this;
    }

    public function getCALLE(): ?string
    {
        return $this->CALLE;
    }

    public function setCALLE(?string $CALLE): self
    {
        $this->CALLE = $CALLE;

        return $this;
    }

    public function getNUMERO(): ?int
    {
        return $this->NUMERO;
    }

    public function setNUMERO(?int $NUMERO): self
    {
        $this->NUMERO = $NUMERO;

        return $this;
    }

    public function getPPAICERRADO(): ?string
    {
        return $this->PPAI_CERRADO;
    }

    public function setPPAICERRADO(?string $PPAI_CERRADO): self
    {
        $this->PPAI_CERRADO = $PPAI_CERRADO;

        return $this;
    }

    public function getSOLAPE(): ?string
    {
        return $this->SOLAPE;
    }

    public function setSOLAPE(?string $SOLAPE): self
    {
        $this->SOLAPE = $SOLAPE;

        return $this;
    }
}
